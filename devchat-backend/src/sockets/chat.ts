const roomCodeState: Record<string, string> = {};
const onlineUsers: Record<string, any[]> = {};

import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import Message from "../models/Message";
import { getOrbitReply } from "../services/orbit";
import User from "../models/User";

interface CustomSocket extends Socket {
  user?: any;
}

const triggerWords = [
  "error",
  "bug",
  "issue",
  "undefined",
  "null",
  "not working",
  "exception",
  "stacktrace",
  "crash",
  "fails",
  "problem",
  "how",
  "why",
  "@orbit"
];

export const initializeSocket = (io: Server) => {

  // JWT middleware
  io.use((socket: CustomSocket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Unauthorized"));

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      );
      socket.user = decoded;
      next();
    } catch {
      return next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket: CustomSocket) => {

    console.log("User connected:", socket.user);

    // JOIN ROOM
    socket.on("join_room", (roomCode: string) => {

      socket.join(roomCode);

      if (!onlineUsers[roomCode]) {
        onlineUsers[roomCode] = [];
      }

      onlineUsers[roomCode].push({
        userId: socket.user.userId,
        username: socket.user.username,
        socketId: socket.id,
      });

      // Send current code to new user
      socket.emit("sync_code", {
        code: roomCodeState[roomCode] || "",
      });

      // Broadcast updated online list
      io.to(roomCode).emit("online_users", onlineUsers[roomCode]);

      socket.to(roomCode).emit("user_joined", {
        username: socket.user.username,
      });
    });

    //  CODE CHANGE
    socket.on("code_change", ({ roomCode, code }) => {
      roomCodeState[roomCode] = code;

      socket.to(roomCode).emit("code_change", { code });
    });

    // MANUAL CODE REQUEST
    socket.on("request_code", (roomCode) => {
      socket.emit("sync_code", {
        code: roomCodeState[roomCode] || "",
      });
    });

    //CHAT + ORBIT
    socket.on("send_message", async (data) => {
      const { roomId, roomCode, content } = data;

      const userMessage = await Message.create({
        roomId,
        senderId: socket.user.userId,
        content,
      });

      io.to(roomCode).emit("receive_message", userMessage);

      if (socket.user.username === "Orbit") return;

      const lowerContent = content.toLowerCase();
      const shouldTrigger = triggerWords.some(word =>
        lowerContent.includes(word)
      );

      if (!shouldTrigger) return;

      try {
        const orbitUser = await User.findOne({
          email: "orbit@ai.dev",
        });
        if (!orbitUser) return;

        const recentMessages = await Message.find({ roomId })
          .sort({ createdAt: -1 })
          .limit(10)
          .populate("senderId", "username");

        const currentCode = roomCodeState[roomCode] || "";

        const chatContext = `
Current Code:
${currentCode}

Conversation:
${recentMessages
          .reverse()
          .map((m) => {
            const sender =
              (m.senderId as any)?.username || "Unknown";
            return `${sender}: ${m.content}`;
          })
          .join("\n")}
`;

        const aiReply = await getOrbitReply(chatContext);

        const aiMessage = await Message.create({
          roomId,
          senderId: orbitUser._id,
          content: aiReply,
        });

        io.to(roomCode).emit("receive_message", aiMessage);

      } catch (error) {
        console.error("Orbit AI failed:", error);
      }
    });


    socket.on("disconnect", () => {

      for (const roomCode in onlineUsers) {
        onlineUsers[roomCode] = onlineUsers[roomCode].filter(
          (user) => user.socketId !== socket.id
        );

        io.to(roomCode).emit("online_users", onlineUsers[roomCode]);
      }

      console.log("User disconnected:", socket.user?.username);
    });

  });
};