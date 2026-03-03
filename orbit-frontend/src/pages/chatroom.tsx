import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { getUsername, getToken, type Room } from "../chatroom/types";
import type { Nav } from "../chatroom/constants";
import { useRooms } from "../chatroom/hooks/useRooms";
import Sidebar from "../components/Sidebar";
import ChatView from "../components/ChatView";
import { CreateModal, JoinModal } from "../components/Modal";
import LobbyPage from "./LobbyPage";
import ProfilePage from "./ProfilePage";

const API_BASE = import.meta.env.VITE_API_BASE;

export default function Chatroom() {
    const navigate = useNavigate();
    const username = getUsername();
    const [nav, setNav] = useState<Nav>("Lobby");
    const [activeRoom, setActiveRoom] = useState<Room | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [showJoin, setShowJoin] = useState(false);
    const [profilePic, setProfilePic] = useState("");
    const [userId, setUserId] = useState(localStorage.getItem("orbit_userId") || "");

    const { rooms, loading, addRoom, removeRoom } = useRooms();

    // Redirect if not logged in
    useEffect(() => { if (!getToken()) navigate("/"); }, [navigate]);

    // Fetch profile pic for the header avatar
    useEffect(() => {
        if (!getToken()) return;
        fetch(`${API_BASE}/api/auth/me`, {
            headers: { Authorization: `Bearer ${getToken()}` },
        })
            .then(r => r.json())
            .then(data => {
                if (data.success && data.user) {
                    if (data.user.profilePic) setProfilePic(data.user.profilePic);
                    // Save userId so isCreator check works even for sessions before this was stored
                    if (data.user._id) {
                        localStorage.setItem("orbit_userId", data.user._id);
                        setUserId(data.user._id);
                    }
                }
            })
            .catch(() => { });
    }, []);

    const logout = () => {
        ["orbit_token", "orbit_username", "orbit_userId"].forEach(k => localStorage.removeItem(k));
        navigate("/");
    };

    const handleNavChange = (n: Nav) => { setNav(n); setActiveRoom(null); };

    const handleRoomDeleted = (roomId: string) => {
        removeRoom(roomId);
        if (activeRoom?._id === roomId) setActiveRoom(null);
    };

    return (
        <div style={{ display: "flex", height: "100vh", background: "#0d0d0d", fontFamily: "'Inter','Segoe UI',sans-serif", overflow: "hidden" }}>

            {!activeRoom && <Sidebar active={nav} setActive={handleNavChange} onLogout={logout} />}

            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
                {/* Top header */}
                <header style={{ height: 58, borderBottom: "1px solid rgba(255,255,255,.07)", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 28px", gap: 12, flexShrink: 0 }}>
                    
                    <span style={{ color: "#fff", fontWeight: 700, fontSize: 15,}}>Hi, {username} !!</span>
                    <button onClick={()=>{setNav("Profile")}} style={{ width: 36, height: 36, borderRadius: "20%", overflow: "hidden", flexShrink: 0 }}>
                        {profilePic ? (
                            <img src={profilePic} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        ) : (
                            <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#7c3aed,#db2777)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: "#fff" }}>
                                {username.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </button>
                </header>

                {/* ── Lobby ── */}
                {nav === "Lobby" && !activeRoom && (
                    <LobbyPage
                        rooms={rooms}
                        loading={loading}
                        onRoomClick={setActiveRoom}
                        onCreateClick={() => setShowCreate(true)}
                        onJoinClick={() => setShowJoin(true)}
                        onDelete={handleRoomDeleted}
                        currentUserId={userId}
                    />
                )}

                {nav === "Lobby" && activeRoom && (
                    <div style={{ flex: 1, display: "flex", overflow: "hidden", minWidth: 0 }}>
                        <ChatView
                            room={activeRoom}
                            onBack={() => setActiveRoom(null)}
                            onDeleted={handleRoomDeleted}
                            currentUserId={userId}
                        />
                    </div>
                )}

                {/* ── Profile ── */}
                {nav === "Profile" && <ProfilePage username={username} rooms={rooms} onLogout={logout} />}

                {/* ── Settings ── */}
                {nav === "Settings" && (
                    <div style={{ padding: 32, color: "#fff" }}>
                        <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 20 }}>Settings</h2>
                        <div style={{ background: "#1a1a1a", borderRadius: 14, padding: 28, border: "1px solid rgba(255,255,255,.08)", maxWidth: 440 }}>
                            <p style={{ color: "rgba(255,255,255,.4)", fontSize: 13 }}>Settings panel coming soon.</p>
                        </div>
                    </div>
                )}

                {/* ── Contact ── */}
                {nav === "Contact Us" && (
                    <div style={{ padding: 32, color: "#fff" }}>
                        <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 20 }}>Contact Us</h2>
                        <div style={{ background: "#1a1a1a", borderRadius: 14, padding: 28, border: "1px solid rgba(255,255,255,.08)", maxWidth: 440 }}>
                            <p style={{ color: "rgba(255,255,255,.4)", fontSize: 13 }}>Reach us at <span style={{ color: "#7c3aed" }}>support@orbit.dev</span></p>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {showCreate && (
                <CreateModal
                    onClose={() => setShowCreate(false)}
                    onCreated={r => { addRoom(r); setActiveRoom(r); }}
                />
            )}
            {showJoin && (
                <JoinModal
                    onClose={() => setShowJoin(false)}
                    onJoined={r => { addRoom(r); setActiveRoom(r); }}
                />
            )}
        </div>
    );
}