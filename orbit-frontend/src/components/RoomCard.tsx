import { useState } from "react";
import type { Room } from "../chatroom/types";
import { roomCover } from "../utils";

const PAL = ["#7c3aed", "#0ea5e9", "#f59e0b", "#10b981", "#ef4444", "#ec4899"];

export function RoomCard({ room, onClick }: { room: Room; onClick: () => void }) {
    const [hov, setHov] = useState(false);
    const cover = roomCover(room.name);

    return (
        <div
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            onClick={onClick}
            style={{ background: "#1a1a1a", border: `1px solid ${hov ? "rgba(255,255,255,.22)" : "rgba(255,255,255,.07)"}`, borderRadius: 12, overflow: "hidden", width: 180, cursor: "pointer", transition: "all .2s", transform: hov ? "translateY(-4px)" : "none", boxShadow: hov ? "0 16px 40px rgba(0,0,0,.5)" : "none" }}
        >
            <div style={{ height: 110, overflow: "hidden", position: "relative" }}>
                <img src={cover} alt={room.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
            </div>
            <div style={{ padding: "10px 12px 14px" }}>
                <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{room.name}</p>
                <p style={{ color: "rgba(255,255,255,.3)", fontSize: 11, margin: "0 0 10px", fontFamily: "monospace" }}>#{room.roomCode}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {[0, 1, 2].map(i => (
                        <div key={i} style={{ width: 18, height: 18, borderRadius: "50%", background: PAL[(i + 2) % PAL.length], border: "2px solid #1a1a1a", marginLeft: i === 0 ? 0 : -6 }} />
                    ))}
                    <span style={{ color: "rgba(255,255,255,.4)", fontSize: 11 }}>{room.members.length} Member{room.members.length !== 1 ? "s" : ""}</span>
                </div>
            </div>
        </div>
    );
}

export function DashedCard({ label, onClick }: { label: string; onClick: () => void }) {
    const [hov, setHov] = useState(false);
    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{ width: 180, height: 192, border: `2px dashed ${hov ? "rgba(255,255,255,.4)" : "rgba(255,255,255,.17)"}`, borderRadius: 12, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer", color: hov ? "rgba(255,255,255,.7)" : "rgba(255,255,255,.3)", fontSize: 13, fontWeight: 600, transition: "all .2s", background: hov ? "rgba(255,255,255,.03)" : "transparent", transform: hov ? "translateY(-4px)" : "none" }}
        >
            <span style={{ fontSize: 22 }}>+</span>
            <span>{label}</span>
        </div>
    );
}