import QRCode from "qrcode";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

export const generateQR = async (token) => {
  // generate QR in memory
  const qrBuffer = await QRCode.toBuffer(token);

  // write temp file
  const tempPath = `./temp-${token}.png`;
  fs.writeFileSync(tempPath, qrBuffer);

  // upload to cloudinary
  const result = await cloudinary.uploader.upload(tempPath, {
    folder: "vendorverify/qrcodes"
  });

  // cleanup temp file
  fs.unlinkSync(tempPath);

  return result.secure_url;
};


// import QRCode from "qrcode";
// import path from "path";
// import fs from "fs";

// export const generateQR = async (token) => {
//   const uploadDir = path.join(process.cwd(), "uploads/qrcodes");

//   if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true });
//   }

//   const fileName = `${token}.png`;
//   const filePath = path.join(uploadDir, fileName);

//   await QRCode.toFile(filePath, token);

//   return `/uploads/qrcodes/${fileName}`;
// };
