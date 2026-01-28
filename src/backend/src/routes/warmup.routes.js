import { Router } from "express";
import warmupController from "../controllers/warmup.controllers.js";

const router = Router();

// Simple warmup/health endpoint for cold-start hosting
router.get("/", warmupController.warmup);

export default router;
