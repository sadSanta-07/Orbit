import { useState, useEffect } from "react";
import type { Room } from "../chatroom/types";
import { getToken } from "../chatroom/types";
import EditProfileModal from "../modals/EditProfileModal";

const API = `${import.meta.env.VITE_API_BASE}/api/auth`;

interface UserProfile {
    username: string;
    email: string;
    bio: string;
    address: string;
    profilePic: string;
    createdAt: string;
}

interface ProfilePageProps {
    username: string;
    rooms: Room[];
    onLogout: () => void;
}

export default function ProfilePage({ username: initialUsername, rooms, onLogout }: ProfilePageProps) {
    const [profile, setProfile] = useState<UserProfile>({
        username: initialUsername,
        email: "",
        bio: "",
        address: "",
        profilePic: "",
        createdAt: "",
    });
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [showEdit, setShowEdit] = useState(false);
    const [deleteState, setDeleteState] = useState<"idle" | "confirm" | "deleting">("idle");
    const [deleteError, setDeleteError] = useState("");

    useEffect(() => {
        const fetchMe = async () => {
            try {
                const res = await fetch(`${API}/me`, {
                    headers: { Authorization: `Bearer ${getToken()}` },
                });
                const data = await res.json();
                if (data.success && data.user) {
                    setProfile({
                        username: data.user.username,
                        email: data.user.email,
                        bio: data.user.bio || "",
                        address: data.user.address || "",
                        profilePic: data.user.profilePic || "",
                        createdAt: data.user.createdAt || "",
                    });
                }
            } catch (_) {
                // fail silently – use initial props
            } finally {
                setLoadingProfile(false);
            }
        };
        fetchMe();
    }, []);

    const handleDeleteAccount = async () => {
        if (deleteState === "idle") { setDeleteState("confirm"); return; }
        if (deleteState === "confirm") {
            setDeleteState("deleting");
            setDeleteError("");
            try {
                const res = await fetch(`${API}/delete-account`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${getToken()}` },
                });
                const data = await res.json();
                if (!data.success) throw new Error(data.message || "Delete failed");
                ["orbit_token", "orbit_username", "orbit_userId"].forEach(k => localStorage.removeItem(k));
                onLogout();
            } catch (err: any) {
                setDeleteError(err.message || "Failed to delete account");
                setDeleteState("idle");
            }
        }
    };

    const formattedDate = profile.createdAt
        ? new Date(profile.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
        : new Date().toLocaleDateString("en-IN");

    return (
        <div style={{ padding: "28px 32px", color: "#fff", overflowY: "auto", flex: 1 }}>
            <div style={{ background: "#1a1a1a", borderRadius: 16, border: "1px solid rgba(255,255,255,.08)", padding: "28px 32px", maxWidth: 760 }}>

                {/* Profile Header */}
                <div style={{ display: "flex", gap: 28, alignItems: "flex-start", marginBottom: 28 }}>

                    {/* Avatar */}
                    <div style={{ width: 130, height: 130, borderRadius: 14, flexShrink: 0, overflow: "hidden", position: "relative" }}>
                        {profile.profilePic ? (
                            <img
                                src={profile.profilePic}
                                alt="profile"
                                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                            />
                        ) : (
                            <div style={{
                                width: "100%", height: "100%",
                                background: "linear-gradient(135deg,#7c3aed,#db2777)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 52, fontWeight: 900, color: "#fff",
                            }}>
                                {profile.username.charAt(0).toUpperCase()}
                            </div>
                        )}
                        {loadingProfile && (
                            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <div style={{ width: 24, height: 24, border: "3px solid rgba(255,255,255,.2)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, display: "flex", gap: 0, alignItems: "stretch" }}>
                        <div style={{ flex: 1, paddingRight: 28 }}>
                            <p style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px" }}>
                                Hie, <span>{profile.username}</span>
                            </p>
                            <p style={{ color: "rgba(255,255,255,.45)", fontSize: 13, lineHeight: 1.65, margin: 0, maxWidth: 300 }}>
                                {profile.bio || "No bio yet. Click Edit to add one!"}
                            </p>
                        </div>
                        <div style={{ width: 1, background: "rgba(255,255,255,.08)", flexShrink: 0 }} />
                        <div style={{ paddingLeft: 28, display: "flex", flexDirection: "column", gap: 10, justifyContent: "center" }}>
                            <p style={{ color: "rgba(255,255,255,.42)", fontSize: 13, margin: 0 }}>
                                {profile.email || `${profile.username.toLowerCase()}@orbit.dev`}
                            </p>
                            <p style={{ color: "rgba(255,255,255,.42)", fontSize: 13, margin: 0 }}>
                                {profile.address || "Location not set"}
                            </p>
                            <p style={{ color: "rgba(255,255,255,.42)", fontSize: 13, margin: 0 }}>
                                Profile created on – {formattedDate}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Activity */}
                <p style={{ fontWeight: 700, fontSize: 18, margin: "0 0 16px" }}>Your Activity</p>
                <div style={{ display: "flex", gap: 14, marginBottom: 28 }}>
                    {[
                        { label: "Total Group\njoined", value: rooms.length },
                        { label: "Total Time Spent\nin hr", value: Math.max(1, rooms.length * 2) },
                        { label: "Total code lines\nwritten", value: rooms.length * 84 },
                    ].map(stat => (
                        <div key={stat.label} style={{ flex: 1, background: "#111", border: "1px solid rgba(255,255,255,.07)", borderRadius: 12, padding: "16px 20px" }}>
                            <p style={{ color: "rgba(255,255,255,.45)", fontSize: 12, whiteSpace: "pre-line", margin: "0 0 8px", lineHeight: 1.4 }}>{stat.label}</p>
                            <p style={{ color: "#fff", fontSize: 42, fontWeight: 800, margin: 0, letterSpacing: -1 }}>{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
                    {deleteState === "confirm" ? (
                        <>
                            <span style={{ color: "rgba(255,255,255,.5)", fontSize: 13 }}>Are you sure? This cannot be undone.</span>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleteState === "deleting" as any}
                                style={{ background: "rgba(220,38,38,.85)", border: "none", borderRadius: 10, color: "#fff", padding: "10px 22px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
                            >
                                Yes, delete
                            </button>
                            <button
                                onClick={() => { setDeleteState("idle"); setDeleteError(""); }}
                                style={{ background: "transparent", border: "1px solid rgba(255,255,255,.15)", borderRadius: 10, color: "rgba(255,255,255,.55)", padding: "10px 18px", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleteState === "deleting"}
                                style={{ background: "rgba(180,30,30,.22)", border: "1px solid rgba(220,50,50,.35)", borderRadius: 10, color: "#f87171", padding: "10px 24px", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
                            >
                                {deleteState === "deleting" ? "Deleting…" : "Delete Account"}
                            </button>
                            <button
                                onClick={() => setShowEdit(true)}
                                style={{ background: "#fff", border: "none", borderRadius: 24, color: "#000", padding: "10px 36px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
                            >
                                Edit
                            </button>
                        </>
                    )}
                    {deleteError && <p style={{ color: "#f87171", fontSize: 12, margin: 0 }}>{deleteError}</p>}
                </div>
            </div>

            {/* Spinner keyframe (inline style tag) */}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

            {/* Edit Modal */}
            {showEdit && (
                <EditProfileModal
                    user={profile}
                    onClose={() => setShowEdit(false)}
                    onSaved={(updated) => {
                        setProfile(updated);
                        setShowEdit(false);
                    }}
                />
            )}
        </div>
    );
}