import QRCode from "qrcode";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";
import path from "path";

export const generateQR = async (token) => {
  try {
    // generate QR in memory
    const qrBuffer = await QRCode.toBuffer(token);

    const sanitizedToken = String(token).slice(0, 32);

    // Optional: explicitly configured public base URL for assets (for multi-origin setups)
    // Example: https://your-backend.example.com or https://your-frontend.example.com
    const rawPublicBase = process.env.PUBLIC_BASE_URL;
    const publicBaseUrl = rawPublicBase ? rawPublicBase.replace(/\/+$/u, "") : "";

    const hasCloudinaryConfig = Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
    );

    // temp file for Cloudinary upload (and also a safe fallback path)
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const tempPath = path.join(tempDir, `qr-${sanitizedToken}-${Date.now()}.png`);
    fs.writeFileSync(tempPath, qrBuffer);

    // Try Cloudinary first when configured
    if (hasCloudinaryConfig) {
      try {
        const result = await cloudinary.uploader.upload(tempPath, {
          folder: 'vendorverify/qrcodes',
          resource_type: 'image'
        });

        return result.secure_url;
      } catch (cloudErr) {
        console.error('[QR] Cloudinary upload failed; falling back to local uploads:', cloudErr);
      } finally {
        try {
          fs.unlinkSync(tempPath);
        } catch (cleanupError) {
          console.warn('Failed to cleanup temp file:', cleanupError);
        }
      }
    } else {
      // Not configured: no point trying
      try {
        fs.unlinkSync(tempPath);
      } catch {
        // ignore
      }
    }

    // Local fallback: write to backend/uploads/qrcodes and return a public URL
    const uploadDir = path.join(process.cwd(), 'uploads', 'qrcodes');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `qr-${sanitizedToken}-${Date.now()}.png`;
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, qrBuffer);

    // If a PUBLIC_BASE_URL is provided, return an absolute URL (useful when
    // frontend and backend are on different origins). Otherwise, return a
    // relative URL that works for single-process deployments where the
    // backend also serves the frontend and /uploads.
    if (publicBaseUrl) {
      return `${publicBaseUrl}/uploads/qrcodes/${fileName}`;
    }

    return `/uploads/qrcodes/${fileName}`;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw new Error(`Failed to generate QR code: ${error?.message || error}`);
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
