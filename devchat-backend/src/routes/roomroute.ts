import express from "express";
import {
  createRoom,
  joinRoom,
  getMyRooms,
} from "../controllers/roomcontroller";
import { protect } from "../middleware/authmiddleware";

const router = express.Router();

router.post("/create", protect, createRoom);
router.post("/join", protect, joinRoom);
router.get("/my", protect, getMyRooms);

export default router;