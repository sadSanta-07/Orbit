import tubeImg from "../assets/tube.jpg";
import { NAV, type Nav } from "../chatroom/constants";

interface SidebarProps {
    active: Nav;
    setActive: (n: Nav) => void;
    onLogout: () => void;
}

export default function Sidebar({ active, setActive, onLogout }: SidebarProps) {
    return (
        <aside style={{ width: 180, minHeight: "100vh", background: "#111", borderRight: "1px solid rgba(255,255,255,.07)", display: "flex", flexDirection: "column", flexShrink: 0 }}>
            <div style={{ padding: "20px 20px 28px", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: "#fff", fontWeight: 800, fontSize: 20 }}>Orbit</span>
                <img src={tubeImg} alt="orbit" style={{ height: 28, width: 56, objectFit: "cover", borderRadius: 8, display: "block" }} />
            </div>
            <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, padding: "0 10px" }}>
                {NAV.map(item => (
                    <button key={item} onClick={() => setActive(item)}
                        style={{ background: active === item ? "rgba(255,255,255,.1)" : "transparent", border: "none", borderRadius: 8, color: active === item ? "#fff" : "rgba(255,255,255,.5)", textAlign: "left", padding: "10px 14px", fontSize: 14, fontWeight: active === item ? 600 : 400, cursor: "pointer", transition: "all .15s" }}
                        onMouseEnter={e => { if (active !== item) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.05)"; }}
                        onMouseLeave={e => { if (active !== item) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >{item}</button>
                ))}
            </nav>
            <div style={{ padding: "0 10px 24px", display: "flex", flexDirection: "column", gap: 8 }}>
                <button style={{ background: "rgba(180,30,30,.25)", border: "1px solid rgba(220,50,50,.3)", borderRadius: 8, color: "#f87171", padding: "10px 14px", fontSize: 14, fontWeight: 600, cursor: "pointer", textAlign: "left" }}>Report</button>
                <button onClick={onLogout} style={{ background: "transparent", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, color: "rgba(255,255,255,.35)", padding: "8px 14px", fontSize: 12, cursor: "pointer", textAlign: "left" }}>Log out</button>
            </div>
        </aside>
    );
}