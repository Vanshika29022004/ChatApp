import express from 'express';
import { login,signup,logout } from '../controllers/authcontroller.js';

const router = express.Router();

// SignUp Route
router.post('/signup', signup);
// Login Route
router.post('/login', login);
// Logout Route
router.post('/logout', logout);

router.post("/onboarding", protectRoute, onboard);


// Export the router

export default router;
 