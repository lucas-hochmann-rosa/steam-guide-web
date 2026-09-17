import React, { useEffect, useRef, useState } from 'react';

export default function QRScannerModal({ isOpen, onClose, onDetected }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const [error, setError] = useState('');

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startScanner = async () => {
    stopStream();
    setError('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      streamRef.current = stream;

      const videoTrack = stream.getVideoTracks()[0];
      const capabilities = videoTrack.getCapabilities?.();
      if (capabilities?.zoom && capabilities.zoom.min <= 1 && capabilities.zoom.max >= 1) {
        await videoTrack.applyConstraints({
          advanced: [{ zoom: 1 }],
        }).catch(() => {});
      }

      await new Promise((resolve) => window.setTimeout(resolve, 100));

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const Detector = window.BarcodeDetector;
      if (!Detector) {
        setError(
          'A câmera abriu, mas este navegador não reconhece QR Codes nativamente. Use o leitor de QR padrão do seu celular.'
        );
        return;
      }

      const detector = new Detector({ formats: ['qr_code'] });
      timerRef.current = window.setInterval(async () => {
        if (!videoRef.current) return;
        const codes = await detector.detect(videoRef.current).catch(() => []);
        if (codes && codes[0]?.rawValue) {
          const raw = codes[0].rawValue;
          let id = raw;
          try {
            id = new URL(raw).searchParams.get('local') || raw;
          } catch {
            // Se não for URL, usa o próprio texto lido
          }
          stopStream();
          onDetected(id.toLowerCase());
        }
      }, 500);
    } catch {
      setError('Não foi possível acessar a câmera. Autorize o uso da câmera no navegador e tente novamente.');
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
          <p className="scanner-hint">Aponte a câmera para o QR Code da sala.</p>
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
        </div>

        {error && (
          <div className="scanner-error">
            <p>{error}</p>
            <button onClick={startScanner}>Tentar liberar a câmera novamente</button>
          </div>
        )}
      </div>
    </div>
  );
}
