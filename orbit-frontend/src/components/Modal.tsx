import { useState } from "react";
import { type Room, hdrs } from "../chatroom/types";
import { API_BASE } from "../chatroom/constants";

// ─── Shared styles ────────────────────────────────────────────────────────────
const mT: React.CSSProperties = { color: "#fff", fontSize: 20, fontWeight: 700, margin: "0 0 6px" };
const mS: React.CSSProperties = { color: "rgba(255,255,255,.4)", fontSize: 12, margin: "0 0 20px" };
const ci: React.CSSProperties = { width: "100%", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, padding: "10px 12px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" };
const cl: React.CSSProperties = { display: "block", color: "rgba(255,255,255,.55)", fontSize: 12, marginBottom: 6 };

// ─── Base Modal ───────────────────────────────────────────────────────────────
export function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
    return (
        <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div onClick={e => e.stopPropagation()} style={{ background: "#161616", border: "1px solid rgba(255,255,255,.1)", borderRadius: 16, padding: "32px 28px", width: 360, boxShadow: "0 24px 80px rgba(0,0,0,.7)", position: "relative", animation: "fadeUp .22s ease" }}>
                {children}
            </div>
            <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>
        </div>
    );
}

// ─── Create Room Modal ─────────────────────────────────────────────────────────
export function CreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: (r: Room) => void }) {
    const [name, setName] = useState("");
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErr("");
        try {
            const res = await fetch(`${API_BASE}/api/rooms/create`, { method: "POST", headers: hdrs(), body: JSON.stringify({ name }) });
            const data = await res.json();
            if (!res.ok) setErr(data?.message || "Failed");
            else { onCreated(data.data); onClose(); }
        } catch { setErr("Network error"); }
        finally { setLoading(false); }
    };

    return (
        <Modal onClose={onClose}>
            <button onClick={onClose} style={{ position: "absolute", top: 14, right: 16, background: "none", border: "none", color: "rgba(255,255,255,.4)", fontSize: 20, cursor: "pointer" }}>×</button>
            <h2 style={mT}>Create a Room</h2>
            <p style={mS}>Rooms auto-delete after 24 hrs of inactivity.</p>
            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                    <label style={cl}>Room Name</label>
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Code Crushers" required style={ci} />
                </div>
                {err && <p style={{ color: "#f87171", fontSize: 12, margin: 0 }}>{err}</p>}
                <button type="submit" disabled={loading} style={{ background: loading ? "rgba(255,255,255,.5)" : "#fff", color: "#000", border: "none", borderRadius: 8, padding: "11px 0", fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer" }}>
                    {loading ? "Creating…" : "Create Room"}
                </button>
            </form>
        </Modal>
    );
}

// ─── Join Room Modal ───────────────────────────────────────────────────────────
export function JoinModal({ onClose, onJoined }: { onClose: () => void; onJoined: (r: Room) => void }) {
    const [code, setCode] = useState("");
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErr("");
        try {
            const res = await fetch(`${API_BASE}/api/rooms/join`, { method: "POST", headers: hdrs(), body: JSON.stringify({ roomCode: code.toUpperCase() }) });
            const data = await res.json();
            if (!res.ok) setErr(data?.message || "Room not found");
            else { onJoined(data.data); onClose(); }
        } catch { setErr("Network error"); }
        finally { setLoading(false); }
    };

    return (
        <Modal onClose={onClose}>
            <button onClick={onClose} style={{ position: "absolute", top: 14, right: 16, background: "none", border: "none", color: "rgba(255,255,255,.4)", fontSize: 20, cursor: "pointer" }}>×</button>
            <h2 style={mT}>Join a Room</h2>
            <p style={mS}>Enter the 6-character code from your friend.</p>
            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                    <label style={cl}>Room Code</label>
                    <input value={code} onChange={e => setCode(e.target.value)} placeholder="AB12CD" maxLength={6} required style={{ ...ci, textTransform: "uppercase", letterSpacing: 4, fontWeight: 700 }} />
                </div>
                {err && <p style={{ color: "#f87171", fontSize: 12, margin: 0 }}>{err}</p>}
                <button type="submit" disabled={loading} style={{ background: loading ? "rgba(255,255,255,.5)" : "#fff", color: "#000", border: "none", borderRadius: 8, padding: "11px 0", fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer" }}>
                    {loading ? "Joining…" : "Join Room"}
                </button>
            </form>
        </Modal>
    );
}