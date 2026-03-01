import { useState } from "react";
import { useNavigate } from "react-router-dom";
import saturnBg from "../assets/saturn.jpg";
import RegisterModal from "../modals/RegisterModal";
import LoginModal from "../modals/LoginModal";
import Footer from "../components/footer";
import Navbar from "../components/Navbar";
const avatars = [
    "https://i.pravatar.cc/32?img=1",
    "https://i.pravatar.cc/32?img=2",
    "https://i.pravatar.cc/32?img=3",
];


export default function Home() {
    const navigate = useNavigate();
    const [showRegister, setShowRegister] = useState(false);
    const [showLogin, setShowLogin] = useState(false);

    return (
        <div
            className="relative h-screen w-full flex flex-col overflow-hidden font-sans"
            style={{
                backgroundImage: `url(${saturnBg})`,
                backgroundSize: "cover",
                backgroundPosition: "center top",
                fontFamily: "'Inter', 'Segoe UI', sans-serif",
            }}
        >
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/80 z-0" />

            <Navbar onShowRegister={() => setShowRegister(true)} onShowLogin={() => setShowLogin(true)} />

            <main className="relative z-10 flex flex-col justify-end flex-grow pb-20 px-10  overflow-hidden">
                <h1 className="text-white text-4xl sm:text-5xl font-bold leading-tight max-w-md mb-4 drop-shadow-lg">
                    Beyond Distractions.Enter<br />
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

                <p className="text-white/60 text-sm max-w-sm mb-8 leading-relaxed">
                    Orbit is a real-time collaborative web-based coding platform where developers can write and edit code
                    together in the same environment, communicate instantly through integrated chat, and receive contextual AI
                    assistance that analyzes discussions
                </p>

                <div className="flex items-center gap-6 flex-wrap">
                    <button
                        onClick={() => setShowRegister(true)} className="flex items-center gap-3 bg-white text-black text-sm font-medium px-6 py-3 rounded-lg hover:bg-white/90 active:scale-95 transition-all shadow-lg">

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
            <div className="relative z-10 flex-shrink-0">
                <Footer />
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
