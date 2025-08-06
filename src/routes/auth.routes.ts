import { Router } from "express";
import authController from "../controllers/auth.controllers";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.post("/login", authController.login);
router.post("/register", authController.register);
router.get("/me", authenticate, (req, res) => {
  res.status(200).json({ user: req.user });
});

export default router;
