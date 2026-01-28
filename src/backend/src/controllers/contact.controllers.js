import ContactMessage from "../models/contactMessage.model.js";

const isValidEmail = (email) => {
  if (typeof email !== "string") return false;
  const trimmed = email.trim();
  if (!trimmed) return false;
  // simple & safe email check (not RFC-perfect, but good enough for form validation)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
};

const normalizeText = (value) => (typeof value === "string" ? value.trim() : "");

const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "";
};

async function createContactMessage(req, res) {
  try {
    const name = normalizeText(req.body?.name);
    const email = normalizeText(req.body?.email).toLowerCase();
    const subject = normalizeText(req.body?.subject);
    const message = normalizeText(req.body?.message);

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (name.length > 100) {
      return res.status(400).json({ message: "Name is too long" });
    }

    if (email.length > 254 || !isValidEmail(email)) {
      return res.status(400).json({ message: "Please provide a valid email" });
    }

    if (subject.length > 150) {
      return res.status(400).json({ message: "Subject is too long" });
    }

    if (message.length > 4000) {
      return res.status(400).json({ message: "Message is too long" });
    }

    const ip = getClientIp(req);
    const userAgent = req.headers["user-agent"];

    // Light anti-spam rate limit: max 5 submissions per IP per 10 minutes
    if (ip) {
      const WINDOW_MS = 10 * 60 * 1000;
      const since = new Date(Date.now() - WINDOW_MS);
      const recentCount = await ContactMessage.countDocuments({
        ipAddress: ip,
        createdAt: { $gte: since },
      });

      if (recentCount >= 5) {
        return res.status(429).json({
          message: "Too many messages sent. Please try again later.",
        });
      }
    }

    const created = await ContactMessage.create({
      name,
      email,
      subject,
      message,
      ipAddress: ip,
      userAgent: typeof userAgent === "string" ? userAgent : "",
    });

    return res.status(201).json({
      message: "Message received successfully",
      id: created._id,
    });
  } catch (error) {
    console.error("Error creating contact message:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

const contactController = { createContactMessage };
export default contactController;
