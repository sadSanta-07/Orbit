import type { Room } from "../chatroom/types";

interface ProfilePageProps {
    username: string;
    rooms: Room[];
}

export default function ProfilePage({ username, rooms }: ProfilePageProps) {
    return (
        <div style={{ padding: "28px 32px", color: "#fff", overflowY: "auto", flex: 1 }}>
            <div style={{ background: "#1a1a1a", borderRadius: 16, border: "1px solid rgba(255,255,255,.08)", padding: "28px 32px", maxWidth: 760 }}>
                <div style={{ display: "flex", gap: 28, alignItems: "flex-start", marginBottom: 28 }}>
                    <div style={{ width: 130, height: 130, borderRadius: 14, background: "linear-gradient(135deg,#7c3aed,#db2777)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52, fontWeight: 900, color: "#fff" }}>
                        {username.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, display: "flex", gap: 0, alignItems: "stretch" }}>
                        <div style={{ flex: 1, paddingRight: 28 }}>
                            <p style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px" }}>Hie, <span>{username}</span></p>
                            <p style={{ color: "rgba(255,255,255,.45)", fontSize: 13, lineHeight: 1.65, margin: 0, maxWidth: 300 }}>
                                Curious builder crafting intelligent developer tools, blending real-time collaboration, AI, and clean design to create meaningful tech experiences.
                            </p>
                        </div>
                        <div style={{ width: 1, background: "rgba(255,255,255,.08)", flexShrink: 0 }} />
                        <div style={{ paddingLeft: 28, display: "flex", flexDirection: "column", gap: 10, justifyContent: "center" }}>
                            <p style={{ color: "rgba(255,255,255,.42)", fontSize: 13, margin: 0 }}>{username.toLowerCase()}@orbit.dev</p>
                            <p style={{ color: "rgba(255,255,255,.42)", fontSize: 13, margin: 0 }}>India</p>
                            <p style={{ color: "rgba(255,255,255,.42)", fontSize: 13, margin: 0 }}>Profile created on – {new Date().toLocaleDateString("en-IN")}</p>
                        </div>
                    </div>
                </div>

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

                <div style={{ display: "flex", gap: 14 }}>
                    <button style={{ background: "rgba(180,30,30,.22)", border: "1px solid rgba(220,50,50,.35)", borderRadius: 10, color: "#f87171", padding: "10px 24px", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                        Delete Account
                    </button>
                    <button style={{ background: "#fff", border: "none", borderRadius: 24, color: "#000", padding: "10px 36px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                        Edit
                    </button>
                </div>
            </div>
        </div>
    );
}