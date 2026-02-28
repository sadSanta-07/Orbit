const generateRoomCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};


import { Response } from "express";
import Room from "../models/Room";
import { AuthRequest } from "../middleware/authmiddleware";

export const createRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;
    const userId = req.user.userId;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Room name is required",
      });
    }

    let roomCode = generateRoomCode();

    while (await Room.findOne({ roomCode })) {
      roomCode = generateRoomCode();
    }

    const room = await Room.create({
      name,
      roomCode,
      createdBy: userId,
      members: [userId],
    });

    return res.status(201).json({
      success: true,
      message: "Room created successfully",
      data: room,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Room creation failed",
    });
  }
};

export const joinRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { roomCode } = req.body;
    const userId = req.user.userId;

    const room = await Room.findOne({ roomCode });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    if (!room.members.includes(userId)) {
      room.members.push(userId);
      await room.save();
    }

    return res.status(200).json({
      success: true,
      message: "Joined room successfully",
      data: room,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Join failed",
    });
  }
};


export const getMyRooms = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;

    const rooms = await Room.find({
      members: userId,
    });

    return res.status(200).json({
      success: true,
      data: rooms,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Could not fetch rooms",
    });
  }
};