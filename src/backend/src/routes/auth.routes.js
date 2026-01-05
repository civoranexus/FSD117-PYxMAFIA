import { Router } from "express";

const router = Router();

// Define auth routes here
router.post('/register', (req, res) => {
  // Handle registration
  res.send('Register route');
});


export default router;