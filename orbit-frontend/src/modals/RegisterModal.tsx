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
const API_BASE = import.meta.env.VITE_API_BASE;


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
                                marginTop:"8px",
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
                        {/* <button
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
                        </button> */}
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

export default RegisterModal;
