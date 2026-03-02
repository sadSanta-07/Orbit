import { useState, useRef } from "react";
import { getToken } from "../chatroom/types";

const API = `${import.meta.env.VITE_API_BASE}/api/auth`;

interface UserProfile {
    username: string;
    email: string;
    bio: string;
    address: string;
    profilePic: string;
    createdAt: string;
}

interface EditProfileModalProps {
    user: UserProfile;
    onClose: () => void;
    onSaved: (updated: UserProfile) => void;
}

export default function EditProfileModal({ user, onClose, onSaved }: EditProfileModalProps) {
    const [username, setUsername] = useState(user.username);
    const [bio, setBio] = useState(user.bio || "");
    const [address, setAddress] = useState(user.address || "");
    const [profilePic, setProfilePic] = useState(user.profilePic || "");
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const fileRef = useRef<HTMLInputElement>(null);

    const handlePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setError("");
        try {
            const fd = new FormData();
            fd.append("image", file);
            const res = await fetch(`${API}/profile-pic`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${getToken()}` },
                body: fd,
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message || "Upload failed");
            setProfilePic(data.profilePic);
        } catch (err: any) {
            setError(err.message || "Image upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (!username.trim()) { setError("Username cannot be empty"); return; }
        setSaving(true);
        setError("");
        try {
            const res = await fetch(`${API}/update-profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify({ username: username.trim(), bio, address }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message || "Update failed");
            // Update localStorage username so navbar reflects the change
            localStorage.setItem("orbit_username", data.user.username);
            onSaved({
                username: data.user.username,
                email: data.user.email,
                bio: data.user.bio || "",
                address: data.user.address || "",
                profilePic: profilePic || data.user.profilePic || "",
                createdAt: data.user.createdAt,
            });
        } catch (err: any) {
            setError(err.message || "Save failed");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed", inset: 0, background: "rgba(0,0,0,.62)",
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 1000, backdropFilter: "blur(4px)",
            }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: "#1a1a1a",
                    border: "1px solid rgba(124,58,237,.45)",
                    borderRadius: 18,
                    padding: "32px 32px 28px",
                    width: 440,
                    maxWidth: "92vw",
                    boxShadow: "0 24px 80px rgba(0,0,0,.7)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 0,
                }}
            >
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                    <span style={{ color: "#fff", fontWeight: 800, fontSize: 20 }}>Edit Account</span>
                    <button
                        onClick={handleSave}
                        disabled={saving || uploading}
                        style={{
                            background: saving || uploading ? "rgba(255,255,255,.12)" : "#fff",
                            border: "none", borderRadius: 20,
                            color: saving || uploading ? "rgba(255,255,255,.4)" : "#000",
                            fontWeight: 700, fontSize: 14,
                            padding: "8px 24px", cursor: saving || uploading ? "not-allowed" : "pointer",
                            transition: "all .15s",
                        }}
                    >
                        {saving ? "saving…" : "save"}
                    </button>
                </div>

                {/* Profile Pic */}
                <div
                    onClick={() => !uploading && fileRef.current?.click()}
                    style={{
                        height: 120, borderRadius: 12,
                        background: "#252525",
                        border: "1px dashed rgba(255,255,255,.18)",
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center",
                        cursor: uploading ? "not-allowed" : "pointer",
                        marginBottom: 14, overflow: "hidden",
                        position: "relative", transition: "border-color .2s",
                    }}
                    onMouseEnter={e => !uploading && ((e.currentTarget as HTMLElement).style.borderColor = "rgba(124,58,237,.6)")}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,.18)")}
                >
                    {profilePic ? (
                        <>
                            <img
                                src={profilePic}
                                alt="profile"
                                style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
                            />
                            <div style={{
                                position: "absolute", inset: 0, background: "rgba(0,0,0,.42)",
                                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
                            }}>
                                <span style={{ fontSize: 22 }}>📷</span>
                                <span style={{ color: "rgba(255,255,255,.8)", fontSize: 12, fontWeight: 500 }}>
                                    {uploading ? "Uploading…" : "Change photo"}
                                </span>
                            </div>
                        </>
                    ) : (
                        <>
                            <span style={{ fontSize: 26, marginBottom: 6 }}>📷</span>
                            <span style={{ color: "rgba(255,255,255,.35)", fontSize: 13 }}>
                                {uploading ? "Uploading…" : "Add image"}
                            </span>
                        </>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePicChange} />
                </div>

                {/* Fields */}
                {[
                    { label: "username", value: username, setter: setUsername, placeholder: "username" },
                    { label: "bio", value: bio, setter: setBio, placeholder: "bio" },
                    { label: "address", value: address, setter: setAddress, placeholder: "Address" },
                ].map(({ label, value, setter, placeholder }) => (
                    <input
                        key={label}
                        value={value}
                        onChange={e => setter(e.target.value)}
                        placeholder={placeholder}
                        style={{
                            background: "#252525",
                            border: "1px solid rgba(255,255,255,.1)",
                            borderRadius: 10,
                            color: "#fff",
                            fontSize: 14,
                            padding: "13px 16px",
                            outline: "none",
                            marginBottom: 10,
                            transition: "border-color .2s",
                            fontFamily: "inherit",
                        }}
                        onFocus={e => (e.currentTarget.style.borderColor = "rgba(124,58,237,.6)")}
                        onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,.1)")}
                    />
                ))}

                {error && (
                    <p style={{ color: "#f87171", fontSize: 12, margin: "4px 0 0", textAlign: "center" }}>{error}</p>
                )}
            </div>
        </div>
    );
}
