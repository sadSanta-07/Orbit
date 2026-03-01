import React, { useState } from 'react'


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

const API_BASE = import.meta.env.VITE_API_BASE;;



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


export default LoginModal