import { useState } from "react";
import { useNavigate } from "react-router-dom";
import saturnBg from "../assets/saturn.jpg";


const avatars = [
    "https://i.pravatar.cc/32?img=1",
    "https://i.pravatar.cc/32?img=2",
    "https://i.pravatar.cc/32?img=3",
];

const techItems = ["Google", "Microsoft", "Stripe", "Amazon"];

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

            <div className="relative z-10 border-t border-white/10 bg-black/50 backdrop-blur-sm px-8 py-4">
                <div className="flex items-center justify-around flex-wrap gap-4">
                    {techItems.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-white/75 text-sm">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M12 2C8.13 2 6 3.93 6 6.87c0 1.94.97 3.3 2.91 4.07C7.08 11.7 6 13.12 6 15.13 6 18.07 8.13 20 12 20s6-1.93 6-4.87c0-2.01-1.08-3.43-2.91-4.19C17.03 10.17 18 8.81 18 6.87 18 3.93 15.87 2 12 2Z"
                                    fill="currentColor"
                                    opacity="0.7"
                                />
                            </svg>
                            <span>{item}</span>
                        </div>
                    ))}
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
