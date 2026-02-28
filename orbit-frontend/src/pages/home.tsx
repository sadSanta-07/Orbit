import { useState } from "react";
import { useNavigate } from "react-router-dom";
import saturnBg from "../assets/saturn.jpg";


const avatars = [
    "https://i.pravatar.cc/32?img=1",
    "https://i.pravatar.cc/32?img=2",
    "https://i.pravatar.cc/32?img=3",
];



const API_BASE = "https://orbit-ozih.onrender.com";


function RegisterModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const [form, setForm] = useState({ email: "", username: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");
        try {

            const res = await fetch(`${API_BASE}/api/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "ngrok-skip-browser-warning": "true",
                },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data?.message || data?.error || "Registration failed. Please try again.");
            } else {

                setSuccess("Account created! Logging you in…");
                const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "ngrok-skip-browser-warning": "true",
                    },
                    body: JSON.stringify({ email: form.email, password: form.password }),
                });
                const loginData = await loginRes.json();
                if (loginRes.ok && loginData?.data?.token) {
                    localStorage.setItem("orbit_token", loginData.data.token);
                    localStorage.setItem("orbit_username", loginData.data.user?.username || form.username);
                    localStorage.setItem("orbit_userId", loginData.data.user?.id || "");
                    setSuccess("All set! Redirecting…");
                    setTimeout(() => onSuccess(), 600);
                } else {

                    localStorage.setItem("orbit_username", form.username);
                    setSuccess("Registered! Redirecting…");
                    setTimeout(() => onSuccess(), 600);
                }
            }
        } catch {
            setError("Network error. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    return (

        <div
            className="fixed inset-0 z-50 flex items-center justify-end"
            style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)" }}
            onClick={onClose}
        >

            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: "#0d0d0d",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "16px",
                    padding: "36px 32px 28px",
                    width: "340px",
                    marginRight: "48px",
                    boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
                    position: "relative",
                    animation: "slideIn 0.25s ease",
                }}
            >

                <button
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: "14px",
                        right: "16px",
                        background: "none",
                        border: "none",
                        color: "rgba(255,255,255,0.4)",
                        fontSize: "20px",
                        cursor: "pointer",
                        lineHeight: 1,
                    }}
                    aria-label="Close"
                >
                    ×
                </button>

                <h2 style={{ color: "#fff", fontSize: "22px", fontWeight: 700, margin: "0 0 6px" }}>
                    Create Account
                </h2>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "12px", margin: "0 0 22px", lineHeight: 1.5 }}>
                    Create your Orbit account and start coding together in real time with AI-powered support.
                </p>

                <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.08)", marginBottom: "22px" }} />

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

                    <div>
                        <label style={labelStyle}>Email</label>
                        <input
                            name="email"
                            type="email"
                            placeholder="jhonDeo@gmail.com"
                            value={form.email}
                            onChange={handleChange}
                            required
                            style={inputStyle}
                        />
                    </div>


                    <div>
                        <label style={labelStyle}>username</label>
                        <input
                            name="username"
                            type="text"
                            placeholder="jhonDeo"
                            value={form.username}
                            onChange={handleChange}
                            required
                            style={inputStyle}
                        />
                    </div>


                    <div>
                        <label style={labelStyle}>password</label>
                        <input
                            name="password"
                            type="password"
                            placeholder="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            style={inputStyle}
                        />
                    </div>


                    {error && (
                        <p style={{ color: "#f87171", fontSize: "12px", margin: 0 }}>{error}</p>
                    )}
                    {success && (
                        <p style={{ color: "#4ade80", fontSize: "12px", margin: 0 }}>{success}</p>
                    )}


                    <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                flex: 1,
                                background: loading ? "rgba(255,255,255,0.5)" : "#fff",
                                color: "#000",
                                border: "none",
                                borderRadius: "8px",
                                padding: "11px 0",
                                fontWeight: 600,
                                fontSize: "14px",
                                cursor: loading ? "not-allowed" : "pointer",
                                transition: "opacity 0.2s",
                            }}
                        >
                            {loading ? "Registering…" : "Register"}
                        </button>
                        <button
                            type="button"
                            style={{
                                flex: 1,
                                background: "transparent",
                                color: "#fff",
                                border: "1.5px solid rgba(255,255,255,0.25)",
                                borderRadius: "8px",
                                padding: "11px 0",
                                fontWeight: 600,
                                fontSize: "14px",
                                cursor: "pointer",
                                transition: "border-color 0.2s",
                            }}
                            onMouseEnter={(e) =>
                                ((e.target as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.6)")
                            }
                            onMouseLeave={(e) =>
                                ((e.target as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.25)")
                            }
                        >
                            Google
                        </button>
                    </div>
                </form>

                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px", marginTop: "16px", lineHeight: 1.5 }}>
                    * Create your Orbit account and start coding together in real time with AI-powered support.
                </p>
            </div>

            <style>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(24px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
            `}</style>
        </div>
    );
}

const labelStyle: React.CSSProperties = {
    display: "block",
    color: "rgba(255,255,255,0.65)",
    fontSize: "12px",
    marginBottom: "6px",
};

const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    padding: "10px 12px",
    color: "#fff",
    fontSize: "13px",
    outline: "none",
    boxSizing: "border-box",
};


function LoginModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${API_BASE}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "ngrok-skip-browser-warning": "true",
                },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data?.message || data?.error || "Invalid email or password.");
            } else {
                localStorage.setItem("orbit_token", data.data.token);
                localStorage.setItem("orbit_username", data.data.user?.username || "");
                onSuccess();
            }
        } catch {
            setError("Network error. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-end"
            style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)" }}
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: "#0d0d0d",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "16px",
                    padding: "36px 32px 28px",
                    width: "340px",
                    marginRight: "48px",
                    boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
                    position: "relative",
                    animation: "slideIn 0.25s ease",
                }}
            >

                <button
                    onClick={onClose}
                    style={{ position: "absolute", top: "14px", right: "16px", background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: "20px", cursor: "pointer", lineHeight: 1 }}
                    aria-label="Close"
                >×</button>

                <h2 style={{ color: "#fff", fontSize: "22px", fontWeight: 700, margin: "0 0 6px" }}>Welcome back</h2>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "12px", margin: "0 0 22px", lineHeight: 1.5 }}>
                    Log in to your Orbit account and pick up right where you left off.
                </p>

                <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.08)", marginBottom: "22px" }} />

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div>
                        <label style={labelStyle}>Email</label>
                        <input
                            name="email"
                            type="email"
                            placeholder="jhonDeo@gmail.com"
                            value={form.email}
                            onChange={handleChange}
                            required
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Password</label>
                        <input
                            name="password"
                            type="password"
                            placeholder="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            style={inputStyle}
                        />
                    </div>

                    {error && (
                        <p style={{ color: "#f87171", fontSize: "12px", margin: 0 }}>{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            background: loading ? "rgba(255,255,255,0.5)" : "#fff",
                            color: "#000",
                            border: "none",
                            borderRadius: "8px",
                            padding: "11px 0",
                            fontWeight: 600,
                            fontSize: "14px",
                            cursor: loading ? "not-allowed" : "pointer",
                            marginTop: "4px",
                        }}
                    >
                        {loading ? "Logging in…" : "Log In"}
                    </button>
                </form>

                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px", marginTop: "16px", lineHeight: 1.5 }}>
                    * Don't have an account? Click Register to sign up.
                </p>
            </div>

            <style>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(24px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
            `}</style>
        </div>
    );
}

export default function Home() {
    const navigate = useNavigate();
    const [showRegister, setShowRegister] = useState(false);
    const [showLogin, setShowLogin] = useState(false);

    return (
        <div
            className="relative min-h-screen w-full overflow-hidden font-sans"
            style={{
                backgroundImage: `url(${saturnBg})`,
                backgroundSize: "cover",
                backgroundPosition: "center top",
                fontFamily: "'Inter', 'Segoe UI', sans-serif",
            }}
        >
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/80 z-0" />

            <nav className="relative z-10 flex items-center justify-between px-8 py-5">
                <div className="flex gap-8 text-sm text-white/85">
                    <a href="#" className="hover:text-white transition-colors">About us</a>
                    <a href="#" className="hover:text-white transition-colors">Help</a>
                </div>

                <span className="absolute left-1/2 -translate-x-1/2 text-white text-xl font-semibold tracking-wide">
                    Orbit
                </span>

                <div className="flex gap-6 text-sm text-white/85 items-center">
                    <button
                        onClick={() => setShowRegister(true)}
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
                        onClick={() => { setShowLogin(true); setShowRegister(false); }}
                        style={{ background: "none", border: "none", color: "rgba(255,255,255,0.85)", fontSize: "13px", cursor: "pointer", padding: 0, fontFamily: "inherit" }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#fff")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.85)")}
                    >
                        login
                    </button>
                </div>
            </nav>

            <main className="relative z-10 flex flex-col justify-end min-h-[calc(100vh-140px)] pb-24 px-8">
                <h1 className="text-white text-4xl sm:text-5xl font-bold leading-tight max-w-md mb-4 drop-shadow-lg">
                    Beyond Distractions. Enter<br />
                    Your Orbit of Deep{" "}
                    <em
                        className="not-italic"
                        style={{
                            fontFamily: "'Dancing Script', 'Brush Script MT', cursive",
                            fontWeight: 400,
                            fontSize: "1.1em",
                        }}
                    >
                        focus.
                    </em>
                </h1>

                <p className="text-white/70 text-sm max-w-sm mb-8 leading-relaxed">
                    Orbit is a real-time collaborative web-based coding platform where developers can write and edit code
                    together in the same environment, communicate instantly through integrated chat, and receive contextual AI
                    assistance that analyzes discussions
                </p>

                <div className="flex items-center gap-6 flex-wrap">
                    <button
                        onClick={() => setShowRegister(true)} className="flex items-center gap-3 bg-white text-black text-sm font-medium px-6 py-3 rounded-full hover:bg-white/90 active:scale-95 transition-all shadow-lg">

                        Create Your room now!
                        <span className="text-base">→</span>
                    </button>

                    <div
                        className="ml-auto flex items-center gap-3 bg-black/40 backdrop-blur border border-white/10 rounded-full px-4 py-2 shadow-xl"
                        style={{ marginLeft: "auto", position: "absolute", right: "2rem" }}
                    >
                        <div className="flex -space-x-2">
                            {avatars.map((src, i) => (
                                <img
                                    key={i}
                                    src={src}
                                    alt="user"
                                    className="w-7 h-7 rounded-full border-2 border-black object-cover"
                                />
                            ))}
                        </div>
                        <span className="text-white text-xs font-medium whitespace-nowrap">400K users!</span>
                    </div>
                </div>
            </main>

            <div className="relative z-10 border-t border-white/10 px-8 py-5">
                <div className="flex items-center justify-around flex-wrap gap-6">

                    <div className="flex items-center gap-3 opacity-70 hover:opacity-100 transition-opacity">
                        <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span className="text-white/70 text-sm font-medium">Google</span>
                    </div>

                    <div className="flex items-center gap-3 opacity-70 hover:opacity-100 transition-opacity">
                        <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 1h10v10H1z" fill="#F25022" />
                            <path d="M13 1h10v10H13z" fill="#7FBA00" />
                            <path d="M1 13h10v10H1z" fill="#00A4EF" />
                            <path d="M13 13h10v10H13z" fill="#FFB900" />
                        </svg>
                        <span className="text-white/70 text-sm font-medium">Microsoft</span>
                    </div>

                    <div className="flex items-center gap-3 opacity-70 hover:opacity-100 transition-opacity">
                        <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13.479 9.883c-2.34-.587-3.092-1.19-3.092-2.148 0-1.086.993-1.838 2.628-1.838 1.722 0 2.364.825 2.425 2.04h2.143c-.066-1.676-1.089-3.216-3.12-3.706V2h-2.857v2.205c-1.878.41-3.386 1.633-3.386 3.518 0 2.25 1.862 3.364 4.58 4.03 2.579.6 3.094 1.48 3.094 2.419 0 .692-.49 1.793-2.628 1.793-2.005 0-2.793-.9-2.905-2.04H8.216c.129 2.125 1.706 3.32 3.498 3.725V20H14.571v-2.19c1.89-.36 3.384-1.458 3.384-3.44-.001-2.748-2.35-3.889-4.476-4.487z" fill="#635BFF" />
                        </svg>
                        <span className="text-white/70 text-sm font-medium">Stripe</span>
                    </div>

                    <div className="flex items-center gap-3 opacity-70 hover:opacity-100 transition-opacity">
                        <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.525.124.12.19.07.39-.168.595-.218.19-.47.38-.756.55C17.4 22.614 14.095 23.5 10.44 23.5c-3.838-.004-7.391-1.02-10.656-3.039-.322-.195-.413-.443-.255-.648l.516-.793zm20.755-2.41c-.177-.24-.18-.387-.036-.558.175-.217.523-.197.825.027 1.14.844 2.498 1.267 3.893 1.267.955 0 1.762-.203 2.423-.586.748-.435 1.125-1.04 1.125-1.813 0-.658-.3-1.215-.9-1.672-.415-.313-1.07-.647-1.965-1.003-.905-.356-1.618-.68-2.14-.975-1.068-.614-1.602-1.403-1.602-2.365 0-.96.428-1.745 1.284-2.355.856-.61 1.933-.915 3.232-.915 1.315 0 2.46.286 3.434.857.232.14.333.31.25.51-.092.21-.302.295-.63.253-.03 0-.083-.01-.163-.03-.08-.02-.14-.035-.18-.044-.83-.3-1.677-.45-2.543-.45-.877 0-1.59.184-2.14.55-.55.366-.824.852-.824 1.46 0 .597.28 1.094.84 1.492.365.253.995.55 1.888.893.894.343 1.612.66 2.155.95 1.14.617 1.712 1.45 1.712 2.5 0 1.04-.45 1.9-1.35 2.58-.9.68-2.1 1.02-3.6 1.02-1.412 0-2.77-.36-4.074-1.083z" fill="#FF9900" />
                            <path d="M12 2.5c4.142 0 7.5 3.358 7.5 7.5 0 1.46-.418 2.82-1.14 3.97-.193.307-.44.562-.737.56-.38 0-.648-.28-.648-.655 0-.154.054-.307.166-.462.587-.837.908-1.858.908-2.913 0-2.9-2.35-5.25-5.25-5.25S7.35 7.6 7.35 10.5c0 .93.247 1.8.678 2.55H4.98c-.338-.782-.527-1.64-.527-2.55 0-4.142 3.358-7.5 7.5-7.5z" fill="#FF9900" />
                        </svg>
                        <span className="text-white/70 text-sm font-medium">Amazon</span>
                    </div>

                </div>
            </div>


            {showRegister && (
                <RegisterModal
                    onClose={() => setShowRegister(false)}
                    onSuccess={() => navigate("/chatroom")}
                />
            )}


            {showLogin && (
                <LoginModal
                    onClose={() => setShowLogin(false)}
                    onSuccess={() => navigate("/chatroom")}
                />
            )}
        </div>
    );
}
