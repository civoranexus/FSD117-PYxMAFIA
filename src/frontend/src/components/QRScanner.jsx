import { useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function QRScanner({ onScan }) {
  useEffect(() => {
    const html5QrCode = new Html5Qrcode("qr-reader");
    let isActive = true;

    html5QrCode
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
        },
        (decodedText) => {
          if (!isActive) return;
          isActive = false;
          Promise.resolve(onScan(decodedText)).catch(() => {});
        },
        () => {
          // Intentionally quiet: html5-qrcode calls this very frequently while scanning.
        }
      )
      .catch((err) => {
        console.warn("QR camera start failed:", err);
      });

    return () => {
      isActive = false;
      html5QrCode
        .stop()
        .then(() => html5QrCode.clear())
        .catch(() => {
          // ignore cleanup errors
        });
    };
  }, [onScan]);

  return <div id="qr-reader" className="w-full h-full" />;
}
