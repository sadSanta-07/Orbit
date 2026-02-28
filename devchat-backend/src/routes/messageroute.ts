import express from "express";
import { getMessages } from "../controllers/messagecontroller";
import { protect } from "../middleware/authmiddleware";

const router = express.Router();

router.get("/:roomId", protect, getMessages);

export default router;