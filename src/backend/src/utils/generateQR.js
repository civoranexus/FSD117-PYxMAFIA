import QRCode from "qrcode";
import path from "path";
import fs from "fs";

export const generateQR = async (token) => {
  const uploadDir = path.join(process.cwd(), "uploads/qrcodes");

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileName = `${token}.png`;
  const filePath = path.join(uploadDir, fileName);

  await QRCode.toFile(filePath, token);

  return `/uploads/qrcodes/${fileName}`;
};
