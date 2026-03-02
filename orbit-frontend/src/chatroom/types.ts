export interface Room {
    _id: string;
    name: string;
    roomCode: string;
    members: string[];
    createdBy: string;
}

export interface Msg {
    _id: string;
    roomId: string;
    senderId: { _id: string; username: string } | string;
    content: string;
    createdAt: string;
    _senderName?: string;
}

export interface Op {
    pos: number;
    del: number;
    ins: string;
}

export interface CursorInfo {
    pos: number;
    color: string;
}

export interface PixelPos {
    x: number;
    y: number;
}

export const getUsername = () => localStorage.getItem("orbit_username") || "User";
export const getToken = () => localStorage.getItem("orbit_token") || "";
export const hdrs = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
});

export function resolveName(msg: Msg, idMap: Map<string, string>): string {
    if (msg._senderName) return msg._senderName;
    if (typeof msg.senderId === "object") return msg.senderId.username ?? "Unknown";
    return idMap.get(msg.senderId as string) ?? "User";
}