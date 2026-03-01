interface AboutcardProps {
    onClose: () => void;
}

const Aboutcard = ({ onClose }: AboutcardProps) => {
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
                    maxHeight: "70vh",
                    marginRight: "48px",
                    boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
                    position: "relative",
                    animation: "slideIn 0.25s ease",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <button
                    onClick={onClose}
                    style={{ position: "absolute", top: "14px", right: "16px", background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: "20px", cursor: "pointer", lineHeight: 1 }}
                    aria-label="Close"
                >×</button>

                <h2 style={{ color: "#fff", fontSize: "22px", fontWeight: 700, margin: "0 0 6px", flexShrink: 0 }}>About Orbit</h2>
                {/* drrpo line */}
                <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.08)", marginBottom: "22px", flexShrink: 0 }} /> 
                
                <div style={{ display: "flex", flexDirection: "column", gap: "18px", color: "rgba(255,255,255,0.75)", fontSize: "14px", lineHeight: "1.6", overflowY: "auto", paddingRight: "8px", flexGrow: 1 }} className="about-content">
                  <div>
                    <h3 style={{ color: "#fff", fontSize: "13px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>Our Story</h3>
                    <p style={{ margin: 0 }}>Orbit was born from a passion for collaborative development. Created by 2 college students during a 24-hour hackathon, our mission was to build a platform where developers could code and discuss ideas together seamlessly.</p>
                  </div>

                  <div>
                    <h3 style={{ color: "#fff", fontSize: "13px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>What We Do</h3>
                    <p style={{ margin: 0 }}>Orbit is a collaborative space designed for developers to discuss ideas, write code together in real-time, and build amazing projects as a team. We believe in the power of collective intelligence and peer collaboration.</p>
                  </div>

                  <div>
                    <h3 style={{ color: "#fff", fontSize: "13px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>AI Integration</h3>
                    <p style={{ margin: 0 }}>Our integrated AI works as a group member—participating in discussions, suggesting solutions, and helping your team code faster and smarter.</p>
                  </div>

                  <div>
                    <h3 style={{ color: "#fff", fontSize: "13px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>Recognition</h3>
                    <p style={{ margin: 0 }}>We're proud to have secured the <span style={{ color: "#60a5fa", fontWeight: 600 }}>Top 20 position</span> out of 100 teams in our hackathon, validating our vision for collaborative development.</p>
                  </div>
                </div>
            </div>

            <style>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(24px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                
                .about-content::-webkit-scrollbar {
                    display: none;
                }
                
                .about-content {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
  )
}

export default Aboutcard