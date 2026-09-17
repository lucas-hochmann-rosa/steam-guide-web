import React, { useEffect, useRef, useState, useCallback } from 'react';
import { rooms } from '../data/rooms';
import { resolveRoomId } from '../utils/resolveRoom';

export default function QRScannerModal({ isOpen, onClose, onDetected }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const [error, setError] = useState('');
  const [cameras, setCameras] = useState([]);
  const [activeDeviceId, setActiveDeviceId] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [zoomCapabilities, setZoomCapabilities] = useState(null);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const selectBestCamera = (devices) => {
    const videoInputs = devices.filter((d) => d.kind === 'videoinput');
    if (videoInputs.length <= 1) return videoInputs[0] || null;

    // Filtra câmeras que não sejam frontais
    const backCameras = videoInputs.filter((d) => {
      const label = (d.label || '').toLowerCase();
      return (
        !label.includes('front') &&
        !label.includes('frontal') &&
        !label.includes('user') &&
        !label.includes('selfie')
      );
    });

    const candidates = backCameras.length > 0 ? backCameras : videoInputs;

    // Filtra câmeras ultra-wide (0.5x, 0,5x, 0.6x), macro e de profundidade
    const standardCameras = candidates.filter((d) => {
      const label = (d.label || '').toLowerCase();
      const isUltra =
        label.includes('ultra') ||
        label.includes('0.5') ||
        label.includes('0,5') ||
        label.includes('0.6') ||
        label.includes('macro') ||
        label.includes('depth') ||
        label.includes('tof');
      return !isUltra;
    });

    const pool = standardCameras.length > 0 ? standardCameras : candidates;

    // Prioriza rótulos que explicitamente indicam a câmera principal (1x / main / wide / camera 0 / camera 1)
    const preferred =
      pool.find((d) => {
        const l = (d.label || '').toLowerCase();
        return (
          l.includes('main') ||
          l.includes('principal') ||
          l.includes('1x') ||
          (l.includes('wide') && !l.includes('ultra'))
        );
      }) ||
      pool.find((d) => {
        const l = (d.label || '').toLowerCase();
        return l.includes('camera2 1') || l.includes('camera 1') || l.includes('back 1');
      }) ||
      pool[0];

    return preferred || null;
  };

  const applyZoom = async (track, target) => {
    const caps = track.getCapabilities?.();
    if (!caps?.zoom) return;
    const minZ = caps.zoom.min || 1;
    const maxZ = caps.zoom.max || 1;
    const clamped = Math.min(Math.max(target, minZ), maxZ);
    try {
      await track.applyConstraints({ advanced: [{ zoom: clamped }] });
      setZoomLevel(clamped);
    } catch {
      try {
        await track.applyConstraints({ zoom: clamped });
        setZoomLevel(clamped);
      } catch {}
    }
  };

  const startScanner = async (requestedDeviceId = null) => {
    stopStream();
    setError('');

    try {
      const initialConstraints = {
        video: requestedDeviceId
          ? { deviceId: { exact: requestedDeviceId } }
          : { facingMode: { ideal: 'environment' } },
        audio: false,
      };

      let stream = await navigator.mediaDevices.getUserMedia(initialConstraints);
      streamRef.current = stream;

      // Agora com permissão concedida, enumeramos os dispositivos reais
      const allDevices = await navigator.mediaDevices.enumerateDevices().catch(() => []);
      const videoDevices = allDevices.filter((d) => d.kind === 'videoinput');
      const backDevices = videoDevices.filter((d) => {
        const l = (d.label || '').toLowerCase();
        return !l.includes('front') && !l.includes('frontal') && !l.includes('user') && !l.includes('selfie');
      });

      setCameras(backDevices.length > 0 ? backDevices : videoDevices);

      // Se nenhum deviceId foi pedido expressamente, avalia se a câmera aberta é a 0.5x
      if (!requestedDeviceId && videoDevices.length > 1) {
        const currentTrack = stream.getVideoTracks()[0];
        const currentLabel = (currentTrack.label || '').toLowerCase();
        const best = selectBestCamera(allDevices);

        if (best && best.deviceId) {
          const currentSettings = currentTrack.getSettings?.() || {};
          const isCurrentUltra =
            currentLabel.includes('ultra') ||
            currentLabel.includes('0.5') ||
            currentLabel.includes('0,5') ||
            currentLabel.includes('0.6');

          if (isCurrentUltra || (currentSettings.deviceId && currentSettings.deviceId !== best.deviceId)) {
            // Fecha o stream 0.5x e abre a câmera 1x principal
            stream.getTracks().forEach((t) => t.stop());
            stream = await navigator.mediaDevices.getUserMedia({
              video: { deviceId: { exact: best.deviceId } },
              audio: false,
            });
            streamRef.current = stream;
            setActiveDeviceId(best.deviceId);
          } else {
            setActiveDeviceId(currentSettings.deviceId || best.deviceId);
          }
        }
      } else if (requestedDeviceId) {
        setActiveDeviceId(requestedDeviceId);
      }

      const activeTrack = streamRef.current.getVideoTracks()[0];
      const caps = activeTrack.getCapabilities?.();
      if (caps?.zoom) {
        setZoomCapabilities(caps.zoom);
        // Garante zoom de pelo menos 1x caso o sensor inicialize em 0.5x
        await applyZoom(activeTrack, Math.max(1.0, caps.zoom.min || 1.0));
      } else {
        setZoomCapabilities(null);
      }

      await new Promise((resolve) => window.setTimeout(resolve, 80));

      if (videoRef.current) {
        videoRef.current.srcObject = streamRef.current;
        await videoRef.current.play().catch(() => {});
      }

      const Detector = window.BarcodeDetector;
      if (!Detector) {
        setError(
          'A câmera está ativa, mas este navegador não possui o leitor nativo de QR Code ativado. Se preferir, use o aplicativo de câmera padrão do seu celular apontando para o cartaz da sala.'
        );
        return;
      }

      const detector = new Detector({ formats: ['qr_code'] });
      timerRef.current = window.setInterval(async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) return;
        const codes = await detector.detect(videoRef.current).catch(() => []);
        if (codes && codes[0]?.rawValue) {
          const raw = codes[0].rawValue;
          const matchedId = resolveRoomId(raw, rooms) || raw.toLowerCase();
          stopStream();
          onDetected(matchedId);
        }
      }, 350);
    } catch {
      setError('Não foi possível acessar a câmera. Verifique as permissões de câmera do seu navegador e tente novamente.');
    }
  };

  const handleToggleZoom = () => {
    if (!streamRef.current || !zoomCapabilities) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;
    const nextZoom = zoomLevel >= 1.8 ? 1.0 : 2.0;
    applyZoom(track, nextZoom);
  };

  const handleSwitchCamera = () => {
    if (cameras.length <= 1) return;
    const currentIndex = cameras.findIndex((c) => c.deviceId === activeDeviceId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    const nextDevice = cameras[nextIndex];
    if (nextDevice) {
      startScanner(nextDevice.deviceId);
    }
  };

  useEffect(() => {
    if (isOpen) {
      startScanner();
    } else {
      stopStream();
    }
    return () => stopStream();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="scanner-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Leitura do QR Code da sala"
      onClick={() => {
        stopStream();
        onClose();
      }}
    >
      <div className="scanner-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="scanner-head">
          <div>
            <h2>Ler QR Code da Sala</h2>
            <p className="scanner-hint">Aponte a câmera (1x) para o cartaz do espaço.</p>
          </div>
          <button
            onClick={() => {
              stopStream();
              onClose();
            }}
            aria-label="Fechar leitor"
          >
            ×
          </button>
        </div>

        <div className="camera-frame">
          <video ref={videoRef} playsInline muted />
          <div className="scan-corners" />
        </div>

        <div className="scanner-controls">
          {cameras.length > 1 && (
            <button
              type="button"
              className="scanner-control-btn"
              onClick={handleSwitchCamera}
              title="Alternar entre câmeras traseiras disponíveis"
            >
              🔄 Alternar câmera
            </button>
          )}

          {zoomCapabilities && (zoomCapabilities.max || 1) >= 1.8 && (
            <button
              type="button"
              className="scanner-control-btn"
              onClick={handleToggleZoom}
              title="Ajustar zoom"
            >
              🔍 Zoom {zoomLevel >= 1.8 ? '2x' : '1x'}
            </button>
          )}
        </div>

        {error && (
          <div className="scanner-error">
            <p>{error}</p>
            <button onClick={() => startScanner(activeDeviceId)}>Tentar novamente</button>
          </div>
        )}
      </div>
    </div>
  );
}
