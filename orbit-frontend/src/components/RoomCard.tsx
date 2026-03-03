import { useState } from "react";
import type { Room } from "../chatroom/types";
//import { roomCover } from "../utils";
import { getToken } from "../chatroom/types";
import { randomimage } from "../getrandomimages";
const PAL = ["#7c3aed", "#0ea5e9", "#f59e0b", "#10b981", "#ef4444", "#ec4899"];
const API_BASE = import.meta.env.VITE_API_BASE;

export function RoomCard({
    room,
    onClick,
    onDeleted,
    currentUserId,
}: {
    room: Room;
    onClick: () => void;
    onDeleted?: (roomId: string) => void;
    currentUserId?: string;
}) {
    const [hov, setHov] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [confirmDel, setConfirmDel] = useState(false);
    const cover = randomimage();

    const isCreator = currentUserId && room.createdBy === currentUserId;

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirmDel) { setConfirmDel(true); return; }
        setDeleting(true);
        try {
            const res = await fetch(`${API_BASE}/api/rooms/${room._id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            const data = await res.json();
            if (data.success) onDeleted?.(room._id);
        } catch (_) { }
        setDeleting(false);
        setConfirmDel(false);
    };

    return (
        <div
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => { setHov(false); setConfirmDel(false); }}
            onClick={onClick}
            style={{
                background: "#1a1a1a",
                border: `1px solid ${hov ? "rgba(255,255,255,.22)" : "rgba(255,255,255,.07)"}`,
                borderRadius: 12, overflow: "hidden", width: 180, cursor: "pointer",
                transition: "all .2s", transform: hov ? "translateY(-4px)" : "none",
                boxShadow: hov ? "0 16px 40px rgba(0,0,0,.5)" : "none",
                position: "relative",
            }}
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

            {/* Delete button — only visible on hover for creator */}
            {isCreator && hov && (
                <button
                    onClick={handleDelete}
                    disabled={deleting}
                    style={{
                        position: "absolute", top: 8, right: 8,
                        background: confirmDel ? "rgba(220,38,38,.9)" : "rgba(0,0,0,.65)",
                        border: confirmDel ? "1px solid #ef4444" : "1px solid rgba(255,255,255,.15)",
                        borderRadius: 6,
                        color: confirmDel ? "#fff" : "#f87171",
                        fontSize: 11, fontWeight: 700,
                        padding: "4px 8px",
                        cursor: deleting ? "not-allowed" : "pointer",
                        backdropFilter: "blur(4px)",
                        transition: "all .15s",
                        zIndex: 10,
                    }}
                >
                    {deleting ? "…" : confirmDel ? "Sure?" : "✕"}
                </button>
            )}
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