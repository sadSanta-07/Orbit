import saturnBg from "../assets/saturn.jpg";

/* ─── tiny avatar stack for the 400K badge ─────────────────────────────── */
const avatars = [
    "https://i.pravatar.cc/32?img=1",
    "https://i.pravatar.cc/32?img=2",
    "https://i.pravatar.cc/32?img=3",
];

const techItems = ["Tailwind CSS", "Tailwind CSS", "Tailwind CSS", "Tailwind CSS"];

export default function Home() {
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
            {/* dark overlay — heavier at bottom so text pops */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/80 z-0" />

            {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
            <nav className="relative z-10 flex items-center justify-between px-8 py-5">
                {/* left links */}
                <div className="flex gap-8 text-sm text-white/85">
                    <a href="#" className="hover:text-white transition-colors">About us</a>
                    <a href="#" className="hover:text-white transition-colors">Help</a>
                </div>

                {/* center logo */}
                <span className="absolute left-1/2 -translate-x-1/2 text-white text-xl font-semibold tracking-wide">
                    Orbit
                </span>

                {/* right links */}
                <div className="flex gap-6 text-sm text-white/85">
                    <a href="#" className="hover:text-white transition-colors">Register</a>
                    <a href="#" className="hover:text-white transition-colors">login</a>
                </div>
            </nav>

            {/* ── HERO SECTION ───────────────────────────────────────────────────── */}
            <main className="relative z-10 flex flex-col justify-end min-h-[calc(100vh-140px)] pb-24 px-8">
                {/* headline */}
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

                {/* sub-copy */}
                <p className="text-white/70 text-sm max-w-sm mb-8 leading-relaxed">
                    Orbit is a real-time collaborative web-based coding platform where developers can write and edit code
                    together in the same environment, communicate instantly through integrated chat, and receive contextual AI
                    assistance that analyzes discussions
                </p>

                {/* CTA row */}
                <div className="flex items-center gap-6 flex-wrap">
                    {/* CTA button */}
                    <button
                        className="flex items-center gap-3 bg-white text-black text-sm font-medium px-6 py-3 rounded-full hover:bg-white/90 active:scale-95 transition-all shadow-lg"
                    >
                        Create Your room now!
                        <span className="text-base">→</span>
                    </button>

                    {/* 400K badge — bottom right of screen */}
                    <div
                        className="ml-auto flex items-center gap-3 bg-black/40 backdrop-blur border border-white/10 rounded-full px-4 py-2 shadow-xl"
                        style={{ marginLeft: "auto", position: "absolute", right: "2rem" }}
                    >
                        {/* stacked avatars */}
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

            {/* ── TECH STRIP ─────────────────────────────────────────────────────── */}
            <div className="relative z-10 border-t border-white/10 bg-black/50 backdrop-blur-sm px-8 py-4">
                <div className="flex items-center justify-around flex-wrap gap-4">
                    {techItems.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-white/75 text-sm">
                            {/* Tailwind-ish swirl icon placeholder */}
                            <svg
                                className="w-5 h-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
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
        </div>
    );
}
