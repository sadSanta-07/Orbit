import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://bcc1-59-144-72-89.ngrok-free.app";

/* ─── types ───────────────────────────────────────────────────────────────── */
interface Room {
    id: string;
    name: string;
    description?: string;
    memberCount?: number;
    coverUrl?: string;
}

/* ─── helpers ─────────────────────────────────────────────────────────────── */
function getToken() {
    return localStorage.getItem("orbit_token") || "";
}
function getUsername() {
    return localStorage.getItem("orbit_username") || "User";
}

/* ─── Create Room Modal ───────────────────────────────────────────────────── */
function CreateRoomModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${API_BASE}/api/rooms/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${getToken()}`,
                    "ngrok-skip-browser-warning": "true",
                },
                body: JSON.stringify({ name, description }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data?.message || "Failed to create room.");
            } else {
                onCreated();
                onClose();
            }
        } catch {
            setError("Network error.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                position: "fixed", inset: 0, zIndex: 100,
                background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
                display: "flex", alignItems: "center", justifyContent: "center",
            }}
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: "#1a1a1a",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "14px",
                    padding: "32px",
                    width: "360px",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
                    animation: "fadeUp 0.22s ease",
                    position: "relative",
                }}
            >
                <button
                    onClick={onClose}
                    style={{ position: "absolute", top: 14, right: 16, background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 20, cursor: "pointer" }}
                >×</button>

                <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, margin: "0 0 6px" }}>Create a Room</h2>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, margin: "0 0 24px" }}>
                    Rooms are deleted automatically if inactive for 24 hrs.
                </p>

                <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div>
                        <label style={labelStyle}>Room Name</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Code Crushers"
                            required
                            style={inputStyle}
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What's this room about?"
                            rows={3}
                            style={{ ...inputStyle, resize: "none", lineHeight: 1.5 }}
                        />
                    </div>
                    {error && <p style={{ color: "#f87171", fontSize: 12, margin: 0 }}>{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            background: loading ? "rgba(255,255,255,0.5)" : "#fff",
                            color: "#000",
                            border: "none",
                            borderRadius: 8,
                            padding: "11px 0",
                            fontWeight: 700,
                            fontSize: 14,
                            cursor: loading ? "not-allowed" : "pointer",
                        }}
                    >
                        {loading ? "Creating…" : "Create Room"}
                    </button>
                </form>
            </div>
            <style>{`@keyframes fadeUp { from { opacity:0;transform:translateY(16px); } to { opacity:1;transform:translateY(0); } }`}</style>
        </div>
    );
}

const labelStyle: React.CSSProperties = { display: "block", color: "rgba(255,255,255,0.55)", fontSize: 12, marginBottom: 6 };
const inputStyle: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8, padding: "10px 12px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box",
};

/* ─── Room Card ───────────────────────────────────────────────────────────── */
function RoomCard({ room }: { room: Room }) {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: "#1a1a1a",
                border: hovered ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(255,255,255,0.07)",
                borderRadius: 12,
                overflow: "hidden",
                width: 180,
                cursor: "pointer",
                transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
                transform: hovered ? "translateY(-3px)" : "none",
                boxShadow: hovered ? "0 12px 32px rgba(0,0,0,0.5)" : "none",
            }}
        >
            {/* cover image */}
            <div style={{ height: 110, background: room.coverUrl ? `url(${room.coverUrl}) center/cover` : "linear-gradient(135deg,#2a1a3e,#1a2a3e)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {!room.coverUrl && (
                    <span style={{ fontSize: 32, opacity: 0.4 }}>💬</span>
                )}
            </div>

            {/* info */}
            <div style={{ padding: "10px 12px 12px" }}>
                <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {room.name}
                </p>
                {room.description && (
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, margin: "0 0 10px", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {room.description}
                    </p>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ display: "flex" }}>
                        {[1, 2, 3].map((i) => (
                            <div key={i} style={{
                                width: 18, height: 18, borderRadius: "50%", background: `hsl(${i * 80},50%,55%)`,
                                border: "2px solid #1a1a1a", marginLeft: i === 1 ? 0 : -6,
                            }} />
                        ))}
                    </div>
                    <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}>
                        {room.memberCount ?? 1} Member{(room.memberCount ?? 1) !== 1 ? "s" : ""}
                    </span>
                </div>
            </div>
        </div>
    );
}

/* ─── Add Room Card (dashed) ──────────────────────────────────────────────── */
function AddCard({ onClick }: { onClick: () => void }) {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                width: 180, height: 192,
                border: `2px dashed ${hovered ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.2)"}`,
                borderRadius: 12,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
                color: hovered ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.35)",
                fontSize: 15, fontWeight: 600,
                transition: "all 0.2s",
                background: hovered ? "rgba(255,255,255,0.03)" : "transparent",
                transform: hovered ? "translateY(-3px)" : "none",
            }}
        >
            Add +
        </div>
    );
}

/* ─── Sidebar ─────────────────────────────────────────────────────────────── */
const navItems = ["Lobby", "Profile", "Settings", "Contact Us"] as const;
type NavItem = typeof navItems[number];

function Sidebar({ active, setActive, onLogout }: { active: NavItem; setActive: (n: NavItem) => void; onLogout: () => void }) {
    return (
        <aside style={{
            width: 180, minHeight: "100vh",
            background: "#111", borderRight: "1px solid rgba(255,255,255,0.07)",
            display: "flex", flexDirection: "column",
            padding: "0 0 24px",
            fontFamily: "'Inter','Segoe UI',sans-serif",
        }}>
            {/* logo */}
            <div style={{ padding: "20px 20px 28px", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: "#fff", fontWeight: 800, fontSize: 20 }}>Orbit</span>
                <span style={{ fontSize: 20 }}>🌀</span>
            </div>

            {/* nav links */}
            <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, padding: "0 10px" }}>
                {navItems.map((item) => (
                    <button
                        key={item}
                        onClick={() => setActive(item)}
                        style={{
                            background: active === item ? "rgba(255,255,255,0.1)" : "transparent",
                            border: "none",
                            borderRadius: 8,
                            color: active === item ? "#fff" : "rgba(255,255,255,0.55)",
                            textAlign: "left",
                            padding: "10px 14px",
                            fontSize: 14,
                            fontWeight: active === item ? 600 : 400,
                            cursor: "pointer",
                            transition: "background 0.15s, color 0.15s",
                        }}
                        onMouseEnter={(e) => { if (active !== item) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
                        onMouseLeave={(e) => { if (active !== item) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                        {item}
                    </button>
                ))}
            </nav>

            {/* Report / Logout */}
            <div style={{ padding: "0 10px", display: "flex", flexDirection: "column", gap: 8 }}>
                <button
                    style={{
                        background: "rgba(180,30,30,0.25)", border: "1px solid rgba(220,50,50,0.3)",
                        borderRadius: 8, color: "#f87171",
                        padding: "10px 14px", fontSize: 14, fontWeight: 600,
                        cursor: "pointer", textAlign: "left",
                    }}
                >
                    Report
                </button>
                <button
                    onClick={onLogout}
                    style={{
                        background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 8, color: "rgba(255,255,255,0.35)",
                        padding: "8px 14px", fontSize: 12,
                        cursor: "pointer", textAlign: "left",
                    }}
                >
                    Log out
                </button>
            </div>
        </aside>
    );
}

/* ─── Chatroom (Lobby) Page ───────────────────────────────────────────────── */
export default function Chatroom() {
    const navigate = useNavigate();
    const username = getUsername();
    const [activeNav, setActiveNav] = useState<NavItem>("Lobby");
    const [rooms, setRooms] = useState<Room[]>([]);
    const [showCreate, setShowCreate] = useState(false);
    const [loadingRooms, setLoadingRooms] = useState(true);

    /* fetch user's rooms */
    const fetchRooms = async () => {
        setLoadingRooms(true);
        try {
            const res = await fetch(`${API_BASE}/api/rooms/my`, {
                headers: {
                    "Authorization": `Bearer ${getToken()}`,
                    "ngrok-skip-browser-warning": "true",
                },
            });
            if (res.ok) {
                const data = await res.json();
                // API may return array or { rooms: [] }, handle both
                setRooms(Array.isArray(data) ? data : data.rooms ?? []);
            }
        } catch {
            /* silently fail — show empty state */
        } finally {
            setLoadingRooms(false);
        }
    };

    useEffect(() => {
        const token = getToken();
        if (!token) {
            navigate("/");
        } else {
            fetchRooms();
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("orbit_token");
        localStorage.removeItem("orbit_username");
        navigate("/");
    };

    return (
        <div style={{
            display: "flex",
            minHeight: "100vh",
            background: "#0d0d0d",
            fontFamily: "'Inter','Segoe UI',sans-serif",
        }}>
            {/* ── Sidebar ── */}
            <Sidebar active={activeNav} setActive={setActiveNav} onLogout={handleLogout} />

            {/* ── Main ── */}
            <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                {/* top bar */}
                <header style={{
                    height: 60,
                    borderBottom: "1px solid rgba(255,255,255,0.07)",
                    display: "flex", alignItems: "center", justifyContent: "flex-end",
                    padding: "0 28px", gap: 12,
                }}>
                    <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>hie</span>
                    <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{username}</span>
                    <div style={{
                        width: 36, height: 36, borderRadius: "50%",
                        background: "linear-gradient(135deg,#7c3aed,#db2777)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 16,
                    }}>
                        {username.charAt(0).toUpperCase()}
                    </div>
                </header>

                {/* content */}
                <div style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
                    {activeNav === "Lobby" && (
                        <>
                            {loadingRooms ? (
                                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 14, marginTop: 40, textAlign: "center" }}>
                                    Loading rooms…
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-start" }}>
                                    {rooms.map((room) => (
                                        <RoomCard key={room.id} room={room} />
                                    ))}
                                    <AddCard onClick={() => setShowCreate(true)} />
                                </div>
                            )}
                        </>
                    )}

                    {activeNav === "Profile" && (
                        <div style={{ color: "#fff", maxWidth: 480 }}>
                            <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 16 }}>Profile</h2>
                            <div style={{ background: "#1a1a1a", borderRadius: 12, padding: 24, border: "1px solid rgba(255,255,255,0.08)" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                                    <div style={{
                                        width: 56, height: 56, borderRadius: "50%",
                                        background: "linear-gradient(135deg,#7c3aed,#db2777)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: 24, fontWeight: 700,
                                    }}>
                                        {username.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 700, fontSize: 16, margin: 0 }}>{username}</p>
                                        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, margin: "4px 0 0" }}>Orbit Member</p>
                                    </div>
                                </div>
                                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>More profile settings coming soon.</p>
                            </div>
                        </div>
                    )}

                    {activeNav === "Settings" && (
                        <div style={{ color: "#fff", maxWidth: 480 }}>
                            <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 16 }}>Settings</h2>
                            <div style={{ background: "#1a1a1a", borderRadius: 12, padding: 24, border: "1px solid rgba(255,255,255,0.08)" }}>
                                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Settings panel coming soon.</p>
                            </div>
                        </div>
                    )}

                    {activeNav === "Contact Us" && (
                        <div style={{ color: "#fff", maxWidth: 480 }}>
                            <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 16 }}>Contact Us</h2>
                            <div style={{ background: "#1a1a1a", borderRadius: 12, padding: 24, border: "1px solid rgba(255,255,255,0.08)" }}>
                                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Reach us at <span style={{ color: "#7c3aed" }}>support@orbit.dev</span></p>
                            </div>
                        </div>
                    )}
                </div>

                {/* footer */}
                <footer style={{
                    borderTop: "1px solid rgba(255,255,255,0.07)",
                    padding: "12px 32px",
                    color: "rgba(255,255,255,0.25)",
                    fontSize: 11,
                }}>
                    • groups with no members or inactivity will be deleted in 24hrs automatically
                </footer>
            </main>

            {/* ── Create Room Modal ── */}
            {showCreate && (
                <CreateRoomModal
                    onClose={() => setShowCreate(false)}
                    onCreated={fetchRooms}
                />
            )}
        </div>
    );
}
