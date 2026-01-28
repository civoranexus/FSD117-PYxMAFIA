import { Router } from "express";
import contactController from "../controllers/contact.controllers.js";

const router = Router();

// Public endpoint: store contact-us submissions
router.post("/", contactController.createContactMessage);

export default router;
