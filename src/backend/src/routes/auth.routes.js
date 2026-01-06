import { Router } from "express";
import authController from "../controllers/auth.controllers.js";

const router = Router();

// Define auth routes here
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/logout', authController.logoutUser);


export default router;