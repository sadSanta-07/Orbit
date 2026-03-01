interface HelpcardProps {
    onClose: () => void;
}

const Helpcard = ({ onClose }: HelpcardProps) => {
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

                <h2 style={{ color: "#fff", fontSize: "22px", fontWeight: 700, margin: "0 0 6px" }}>Reach us!</h2>
                <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.08)", marginBottom: "22px" }} />

                <div>                   
                    <p style={{ margin: 0,color: "#fff" }}> we can't gurantee that we will reply but as a sole purpose of making the help button do something we are adding this</p>
                  </div>
                <div style={{marginTop:"20px",fontSize: "13px"}}>                   
                    <p style={{ margin: 0 ,color: "#fff", }}>You can contact us at orbit@help.com, this mail does not exist ehehehehehehe</p>
                  </div>
               
            </div>

            <style>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(24px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
            `}</style>
        </div>
  )
}

export default Helpcard