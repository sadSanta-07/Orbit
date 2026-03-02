import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { Msg } from "../types";
import { API_BASE } from "../constants";

interface UseSocketOptions {
    roomCode: string;
    token: string;
    onMessage: (msg: Msg) => void;
}

export function useSocket({ roomCode, token, onMessage }: UseSocketOptions) {
    const socketRef = useRef<Socket | null>(null);
    const onMessageRef = useRef(onMessage);
    onMessageRef.current = onMessage;

    const [onlineUsers, setOnlineUsers] = useState<{ username: string; socketId: string }[]>([]);

    useEffect(() => {
        const socket = io(API_BASE, { auth: { token }, transports: ["websocket", "polling"] });
        socketRef.current = socket;

        socket.on("connect", () => socket.emit("join_room", roomCode));
        socket.on("receive_message", (msg: Msg) => onMessageRef.current(msg));
        socket.on("online_users", (users: { username: string; socketId: string }[]) =>
            setOnlineUsers(users)
        );

        return () => { socket.disconnect(); };
    }, [roomCode, token]);

    const sendMessage = (payload: { roomId: string; roomCode: string; content: string }) => {
        socketRef.current?.emit("send_message", payload);
    };

    return { socket: socketRef.current, socketRef, onlineUsers, sendMessage };
}