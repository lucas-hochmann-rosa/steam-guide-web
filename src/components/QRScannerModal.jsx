import React, { useEffect, useRef, useState, useCallback } from 'react';
import { rooms } from '../data/rooms';
import { resolveRoomId } from '../utils/resolveRoom';

export default function QRScannerModal({ isOpen, onClose, onDetected }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const [error, setError] = useState('');

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

  const startScanner = async () => {
    stopStream();
    setError('');

    try {
      let stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      streamRef.current = stream;

      // Com permissão concedida, checa se a câmera inicial foi a 0.5x ultra-wide e seleciona a 1x principal
      const allDevices = await navigator.mediaDevices.enumerateDevices().catch(() => []);
      const videoDevices = allDevices.filter((d) => d.kind === 'videoinput');

      if (videoDevices.length > 1) {
        const currentTrack = stream.getVideoTracks()[0];
        const currentLabel = (currentTrack?.label || '').toLowerCase();
        const best = selectBestCamera(allDevices);

        if (best && best.deviceId) {
          const isCurrentUltra =
            currentLabel.includes('ultra') ||
            currentLabel.includes('0.5') ||
            currentLabel.includes('0,5') ||
            currentLabel.includes('0.6');

          if (isCurrentUltra) {
            stream.getTracks().forEach((t) => t.stop());
            stream = await navigator.mediaDevices.getUserMedia({
              video: { deviceId: { exact: best.deviceId } },
              audio: false,
            });
            streamRef.current = stream;
          }
        }
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
          <h2>Ler QR Code da Sala</h2>
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

        {error && (
          <div className="scanner-error">
            <p>{error}</p>
            <button onClick={startScanner}>Tentar novamente</button>
          </div>
        )}
      </div>
    </div>
  );
}
