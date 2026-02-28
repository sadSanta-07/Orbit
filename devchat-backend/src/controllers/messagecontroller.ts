import { Response } from "express";
import Message from "../models/Message";
import { AuthRequest } from "../middleware/authmiddleware";

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { roomId } = req.params;

    const messages = await Message.find({ roomId })
      .populate("senderId", "username email")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
    });
  }
};