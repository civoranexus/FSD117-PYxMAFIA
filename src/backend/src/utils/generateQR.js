import QRCode from "qrcode";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";
import path from "path";

export const generateQR = async (token) => {
  try {
    // generate QR in memory
    const qrBuffer = await QRCode.toBuffer(token);

    // Create temp directory if it doesn't exist
    const tempDir = path.join(process.cwd(), "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // write temp file with sanitized name
    const sanitizedToken = token.substring(0, 32); // Limit filename length
    const tempPath = path.join(tempDir, `qr-${sanitizedToken}.png`);
    fs.writeFileSync(tempPath, qrBuffer);

    // upload to cloudinary
    const result = await cloudinary.uploader.upload(tempPath, {
      folder: "vendorverify/qrcodes",
      resource_type: "image"
    });

    // cleanup temp file
    try {
      fs.unlinkSync(tempPath);
    } catch (cleanupError) {
      console.warn("Failed to cleanup temp file:", cleanupError);
    }

    return result.secure_url;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw new Error("Failed to generate QR code");
  }
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
