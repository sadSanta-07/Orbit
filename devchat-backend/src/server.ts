import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import axios from "axios";
import bcrypt from "bcrypt";

import connectDB from "./config/db";
import authRoutes from "./routes/authroute";
import roomRoutes from "./routes/roomroute";
import messageRoutes from "./routes/messageroute";
import { initializeSocket } from "./sockets/chat";
import User from "./models/User";

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// 🌐 Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true,
  },
});

// Initialize socket logic
initializeSocket(io);

// 🌍 Middlewares
app.use(cors());
app.use(express.json());

// 📌 Routes
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/messages", messageRoutes);

// Root API Info
app.get("/", (req, res) => {
  res.status(200).json({
    service: "Orbit DevChat Backend",
    status: "running",
    version: "1.0.0",
    uptime: process.uptime(),
    timestamp: new Date(),
    endpoints: {
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
      },
      rooms: {
        create: "POST /api/rooms/create",
        join: "POST /api/rooms/join",
        myRooms: "GET /api/rooms/my",
      },
      messages: {
        getRoomMessages: "GET /api/messages/:roomId",
      },
      compile: {
        execute: "POST /api/compile",
      },
    },
    socket: {
      connect: "JWT required in auth",
      events: {
        emit: ["join_room", "send_message", "code_change"],
        listen: [
          "receive_message",
          "online_users",
          "orbit_typing",
          "code_change",
          "sync_code",
        ],
      },
    },
  });
});

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage().rss,
    timestamp: new Date(),
  });
});

// Compile Endpoint
app.post("/api/compile", async (req, res) => {
  const { code, language } = req.body;

  if (!code || !language) {
    return res.status(400).json({
      success: false,
      message: "Code and language are required",
    });
  }

  try {
    const response = await axios.post(
      "https://api.jdoodle.com/v1/execute",
      {
        script: code,
        language,
        versionIndex: "3",
        clientId: process.env.JDOODLE_CLIENT_ID,
        clientSecret: process.env.JDOODLE_CLIENT_SECRET,
      }
    );

    return res.status(200).json({
      success: true,
      output: response.data,
    });
  } catch (error) {
    console.error("Compile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Compilation failed",
    });
  }
});

//  Ensure Orbit AI User Exists
const ensureOrbitUser = async () => {
  const existing = await User.findOne({ email: "orbit@ai.dev" });

  if (!existing) {
    const hashedPassword = await bcrypt.hash(
      "orbit_dummy_password",
      10
    );

    await User.create({
      username: "Orbit",
      email: "orbit@ai.dev",
      password: hashedPassword,
    });

    console.log(" Orbit AI user created");
  }
};

// Start 
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await ensureOrbitUser();

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();