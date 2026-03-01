import { useState } from "react";
import Aboutcard from "../modals/aboutcard";
import Helpcard from "../modals/helpcard";

interface NavbarProps {
    onShowRegister: () => void;
    onShowLogin: () => void;
}

const Navbar = ({ onShowRegister, onShowLogin }: NavbarProps) => {
    const [showAbout, setShowAbout] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    return (
        <>
        <nav className="relative z-10 flex items-center justify-between px-8 py-5 flex-shrink-0">
            <div className="flex gap-8 text-sm text-white/85">
                <button onClick={() => setShowAbout(true)} className="hover:text-white transition-colors">About us</button>
                <button onClick={() => setShowHelp(true)} className="hover:text-white transition-colors">Help</button>
            </div>

            <span className="absolute left-1/2 -translate-x-1/2 text-white text-xl font-semibold tracking-wide">
                Orbit
            </span>

            <div className="flex gap-6 text-sm text-white/85 items-center">
                <button
                    onClick={onShowRegister}
                    style={{
                        background: "#fff",
                        color: "#000",
                        border: "none",
                        borderRadius: "8px",
                        padding: "6px 16px",
                        fontWeight: 600,
                        fontSize: "13px",
                        cursor: "pointer",
                        transition: "opacity 0.2s",
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.85")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
                >
                    Register
                </button>
                <button
                    onClick={() => { onShowLogin(); }}
                    style={{ background: "none", border: "none", color: "rgba(255,255,255,0.85)", fontSize: "13px", cursor: "pointer", padding: 0, fontFamily: "inherit" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#fff")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.85)")}
                >
                    login
                </button>
            </div>
        </nav>
        
        {showAbout && <Aboutcard onClose={() => setShowAbout(false)} />}
        {showHelp && <Helpcard onClose={() => setShowHelp(false)} />}
        </>
    )
}

export default Navbar