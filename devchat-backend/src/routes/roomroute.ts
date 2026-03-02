import express from "express";
import {
  createRoom,
  joinRoom,
  getMyRooms,
  deleteRoom,
} from "../controllers/roomcontroller";
import { protect } from "../middleware/authmiddleware";

const router = express.Router();

router.post("/create", protect, createRoom);
router.post("/join", protect, joinRoom);
router.get("/my", protect, getMyRooms);
router.delete("/:roomId", protect, deleteRoom);

export default router;