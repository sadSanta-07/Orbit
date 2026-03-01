import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import tubeImg from "../assets/tube.jpg";


const API_BASE = "https://orbit-ozih.onrender.com";

const hdrs = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("orbit_token") || ""}`,
});
const getUsername = () => localStorage.getItem("orbit_username") || "User";
const getToken = () => localStorage.getItem("orbit_token") || "";


const LANGUAGES: { label: string; jdoodle: string; ext: string }[] = [
    { label: "Python", jdoodle: "python3", ext: ".py" },
    { label: "JavaScript", jdoodle: "nodejs", ext: ".js" },
    { label: "C++", jdoodle: "cpp17", ext: ".cpp" },
    { label: "C", jdoodle: "c", ext: ".c" },
    { label: "Java", jdoodle: "java", ext: ".java" },
    { label: "TypeScript", jdoodle: "typescript", ext: ".ts" },
];


interface Room { _id: string; name: string; roomCode: string; members: string[]; createdBy: string; }
interface Msg {
    _id: string; roomId: string;
    senderId: { _id: string; username: string } | string;
    content: string; createdAt: string;
    _senderName?: string;
}



function resolveName(
    msg: Msg,
    idMap: Map<string, string>,
): string {
    if (msg._senderName) return msg._senderName;
    if (typeof msg.senderId === "object") return msg.senderId.username ?? "Unknown";

    return idMap.get(msg.senderId as string) ?? "User";
}


interface CodeEditorProps { roomCode: string; socket: Socket | null; }

const CURSOR_PAL = ["#f59e0b", "#22d3ee", "#a78bfa", "#34d399", "#f87171", "#fb923c", "#e879f9", "#60a5fa"];
function curCol(name: string) {
    return CURSOR_PAL[name.split("").reduce((a: number, c: string) => a + c.charCodeAt(0), 0) % CURSOR_PAL.length];
}

interface CursorInfo { pos: number; color: string; }
interface PixelPos { x: number; y: number; }

function CodeEditor({ roomCode, socket }: CodeEditorProps) {
    const [code, setCode] = useState("// Start coding here…\n");
    const [langIdx, setLangIdx] = useState(0);
    const [output, setOutput] = useState("");
    const [running, setRunning] = useState(false);
    const [showLangMenu, setShowLangMenu] = useState(false);
    const [remoteCursors, setRemoteCursors] = useState<Map<string, CursorInfo>>(new Map());
    const [cursorPixels, setCursorPixels] = useState<Map<string, PixelPos>>(new Map());
    const [hoveredCursor, setHoveredCursor] = useState<string | null>(null);

    const suppressSync = useRef(false);
    const taRef = useRef<HTMLTextAreaElement>(null);
    const mirrorRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const codeRef = useRef(code);
    codeRef.current = code;
    const myUsername = getUsername();

    const computePixelPos = useCallback((charOffset: number, currentCode: string): PixelPos | null => {
        const mirror = mirrorRef.current;
        const wrapper = wrapperRef.current;
        const ta = taRef.current;
        if (!mirror || !wrapper || !ta) return null;
        const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/ /g, "\u00a0").replace(/\n/g, "<br>");
        mirror.innerHTML = esc(currentCode.substring(0, charOffset)) + '<span id="mc-c" style="display:inline-block;width:0;height:1em;"></span>' + esc(currentCode.substring(charOffset));
        const caret = mirror.querySelector("#mc-c") as HTMLElement | null;
        if (!caret) return null;
        const wRect = wrapper.getBoundingClientRect();
        const cRect = caret.getBoundingClientRect();
        return { x: cRect.left - wRect.left, y: (cRect.top - wRect.top) - ta.scrollTop };
    }, []);

    const recomputePixels = useCallback((cursors: Map<string, CursorInfo>, currentCode: string) => {
        const pixels = new Map<string, PixelPos>();
        cursors.forEach((info, username) => {
            const px = computePixelPos(info.pos, currentCode);
            if (px) pixels.set(username, px);
        });
        setCursorPixels(new Map(pixels));
    }, [computePixelPos]);

    useEffect(() => {
        recomputePixels(remoteCursors, code);
    }, [remoteCursors, code, recomputePixels]);

    useEffect(() => {
        if (!socket) return;
        const handle = ({ code: incoming, cursorPos, username: senderName }: { code: string; cursorPos?: number; username?: string }) => {
            if (senderName === myUsername) return;

            if (cursorPos !== undefined && senderName) {
                setRemoteCursors(rc => {
                    const next = new Map(rc);
                    next.set(senderName, { pos: cursorPos, color: curCol(senderName) });
                    return next;
                });
            }

            const ta = taRef.current;
            const prevCode = codeRef.current;
            const savedStart = ta?.selectionStart ?? 0;
            const savedEnd = ta?.selectionEnd ?? savedStart;

            suppressSync.current = true;
            setCode(incoming);

            requestAnimationFrame(() => {
                if (ta && incoming !== prevCode) {
                    const delta = incoming.length - prevCode.length;
                    let changeAt = 0;
                    const minLen = Math.min(incoming.length, prevCode.length);
                    while (changeAt < minLen && incoming[changeAt] === prevCode[changeAt]) changeAt++;

                    const newStart = changeAt <= savedStart ? Math.max(0, Math.min(savedStart + delta, incoming.length)) : Math.min(savedStart, incoming.length);
                    const newEnd = changeAt <= savedEnd ? Math.max(0, Math.min(savedEnd + delta, incoming.length)) : Math.min(savedEnd, incoming.length);
                    ta.selectionStart = newStart;
                    ta.selectionEnd = newEnd;
                }
                suppressSync.current = false;
            });
        };
        socket.on("sync_code", handle);
        socket.on("code_change", handle);
        return () => { socket.off("sync_code", handle); socket.off("code_change", handle); };

    }, [socket, myUsername]);

    const emitChange = useCallback((newCode: string) => {
        if (!socket || suppressSync.current) return;
        const pos = taRef.current?.selectionStart ?? 0;
        socket.emit("code_change", { roomCode, code: newCode, cursorPos: pos, username: myUsername });
    }, [socket, roomCode, myUsername]);

    const emitCursor = useCallback(() => {
        if (!socket) return;
        const pos = taRef.current?.selectionStart ?? 0;
        socket.emit("code_change", { roomCode, code: codeRef.current, cursorPos: pos, username: myUsername });
    }, [socket, roomCode, myUsername]);

    const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setCode(val);
        emitChange(val);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Tab") {
            e.preventDefault();
            const ta = taRef.current!;
            const start = ta.selectionStart;
            const end = ta.selectionEnd;
            const newVal = code.substring(0, start) + "    " + code.substring(end);
            setCode(newVal);
            emitChange(newVal);
            requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + 4; });
        }
        if (e.key === "Escape") { emitChange(code); }
    };

    const runCode = async () => {
        if (running || !code.trim()) return;
        setRunning(true);
        setOutput("Running…");
        try {
            const res = await fetch(`${API_BASE}/api/compile`, {
                method: "POST",
                headers: hdrs(),
                body: JSON.stringify({ code, language: LANGUAGES[langIdx].jdoodle }),
            });
            const data = await res.json();
            if (res.ok && data.output) {
                const out = data.output;
                setOutput(out.output ?? out.stderr ?? out.error ?? JSON.stringify(out, null, 2));
            } else {
                setOutput(data?.message || "Compilation failed.");
            }
        } catch {
            setOutput("Network error — could not reach compile server.");
        } finally { setRunning(false); }
    };

    const lineHeightPx = 13.5 * 1.65;

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", borderLeft: "1px solid rgba(255,255,255,0.07)", overflow: "hidden", minWidth: 0 }}>
            <style>{`
                @keyframes cursorBlink { 0%,100%{opacity:1} 50%{opacity:0} }
            `}</style>

            <div style={{ height: 52, borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0 }}>
                <span style={{ color: "#fff", fontWeight: 600, fontSize: 15 }}>Code editor</span>
                <div style={{ display: "flex", gap: 8, alignItems: "center", position: "relative" }}>
                    <button onClick={() => setShowLangMenu(v => !v)} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, color: "rgba(255,255,255,0.7)", fontSize: 12, padding: "3px 10px", cursor: "pointer", fontFamily: "inherit" }}>
                        {LANGUAGES[langIdx].label} ▾
                    </button>
                    {showLangMenu && (
                        <div style={{ position: "absolute", top: "100%", right: 72, marginTop: 4, background: "#1e1e1e", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, overflow: "hidden", zIndex: 50, minWidth: 130, boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}>
                            {LANGUAGES.map((l, i) => (
                                <button key={l.jdoodle} onClick={() => { setLangIdx(i); setShowLangMenu(false); }}
                                    style={{ display: "block", width: "100%", background: i === langIdx ? "rgba(255,255,255,0.1)" : "transparent", border: "none", color: "#fff", textAlign: "left", padding: "8px 14px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                                    {l.label}
                                </button>
                            ))}
                        </div>
                    )}
                    <button onClick={runCode} disabled={running} style={{ background: running ? "#444" : "#22c55e", border: "none", borderRadius: 6, color: "#fff", fontWeight: 700, fontSize: 13, padding: "5px 16px", cursor: running ? "not-allowed" : "pointer", transition: "background .2s" }}>
                        {running ? "…" : "Run"}
                    </button>
                </div>
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <div ref={wrapperRef} style={{ position: "relative", flex: output ? "0 0 60%" : 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

                    <div ref={mirrorRef} aria-hidden="true" style={{
                        position: "absolute", top: 0, left: 0, width: "100%",
                        padding: "16px 20px", fontSize: 13.5, boxSizing: "border-box",
                        fontFamily: "'Fira Code','Cascadia Code','Consolas','Courier New',monospace",
                        lineHeight: 1.65, whiteSpace: "pre-wrap", wordBreak: "break-word",
                        visibility: "hidden", pointerEvents: "none", zIndex: 0,
                    }} />

                    {Array.from(cursorPixels.entries()).map(([username, { x, y }]) => {
                        const info = remoteCursors.get(username);
                        if (!info) return null;
                        return (
                            <div key={username} style={{
                                position: "absolute", left: x, top: y, width: 2,
                                height: lineHeightPx, background: info.color,
                                zIndex: 10, pointerEvents: "all", cursor: "default",
                                animation: "cursorBlink 1s step-end infinite",
                            }}
                                onMouseEnter={() => setHoveredCursor(username)}
                                onMouseLeave={() => setHoveredCursor(null)}
                            >
                                {hoveredCursor === username && (
                                    <div style={{
                                        position: "absolute", bottom: "100%", left: 0,
                                        background: info.color, color: "#000", fontSize: 10,
                                        fontWeight: 700, padding: "2px 6px", borderRadius: "4px 4px 4px 0",
                                        whiteSpace: "nowrap", marginBottom: 2, pointerEvents: "none",
                                    }}>
                                        {username}
                                    </div>
                                )}
                                <div style={{ position: "absolute", top: 0, left: 0, width: 8, height: 8, borderRadius: "0 4px 4px 4px", background: info.color, transform: "translateY(-100%)" }} />
                            </div>
                        );
                    })}

                    <textarea
                        ref={taRef}
                        value={code}
                        onChange={handleCodeChange}
                        onKeyDown={handleKeyDown}
                        onKeyUp={emitCursor}
                        onClick={emitCursor}
                        onSelect={emitCursor}
                        onScroll={() => recomputePixels(remoteCursors, codeRef.current)}
                        spellCheck={false}
                        style={{
                            flex: 1, background: "#111", color: "#e2e8f0",
                            border: "none", outline: "none", resize: "none",
                            padding: "16px 20px", fontSize: 13.5,
                            fontFamily: "'Fira Code','Cascadia Code','Consolas','Courier New',monospace",
                            lineHeight: 1.65, tabSize: 4, transition: "flex .2s",
                            position: "relative", zIndex: 1,
                        }}
                    />
                </div>

                {output && (
                    <div style={{ flex: 1, borderTop: "1px solid rgba(255,255,255,0.07)", background: "#0a0a0a", padding: "12px 20px", overflowY: "auto", minHeight: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                            <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>Output</span>
                            <button onClick={() => setOutput("")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 16, cursor: "pointer", lineHeight: 1 }}>×</button>
                        </div>
                        <pre style={{ color: "#4ade80", fontFamily: "monospace", fontSize: 13, margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                            {output}
                        </pre>
                    </div>
                )}
            </div>

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "8px 20px", color: "rgba(255,255,255,0.2)", fontSize: 11, display: "flex", justifyContent: "flex-end", flexShrink: 0 }}>
                • press esc for exit ( code will be saved auto )
            </div>
        </div>
    );
}



const COVERS = ["/cock.jpg", "/meow.jpg"];
function roomCover(name: string) { return COVERS[name.charCodeAt(0) % COVERS.length]; }

function ChatView({ room, onBack }: { room: Room; onBack: () => void }) {
    const myUsername = getUsername();
    const token = getToken();

    const [messages, setMessages] = useState<Msg[]>([]);
    const [input, setInput] = useState("");
    const [onlineUsers, setOnlineUsers] = useState<{ username: string; socketId: string }[]>([]);
    const [loadingMsgs, setLoadingMsgs] = useState(true);
    const [codeOpen, setCodeOpen] = useState(false);

    const socketRef = useRef<Socket | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const seenIds = useRef<Set<string>>(new Set());
    const idMap = useRef<Map<string, string>>(new Map());

    useEffect(() => {
        const load = async () => {
            setLoadingMsgs(true);
            try {
                const res = await fetch(`${API_BASE}/api/messages/${room._id}`, { headers: hdrs() });
                const data = await res.json();
                if (res.ok) {
                    const msgs: Msg[] = data.data ?? [];
                    msgs.forEach(m => {
                        seenIds.current.add(m._id);
                        if (typeof m.senderId === "object" && m.senderId._id) {
                            idMap.current.set(m.senderId._id, m.senderId.username);
                        }
                    });
                    setMessages(msgs);
                }
            } catch { }
            finally { setLoadingMsgs(false); }
        };
        load();
    }, [room._id]);

    useEffect(() => {
        const socket = io(API_BASE, { auth: { token }, transports: ["websocket", "polling"] });
        socketRef.current = socket;
        socket.on("connect", () => socket.emit("join_room", room.roomCode));
        socket.on("receive_message", (msg: Msg) => {
            if (seenIds.current.has(msg._id)) return;
            seenIds.current.add(msg._id);
            setMessages(prev => [...prev, msg]);
        });
        socket.on("online_users", (users: { username: string; socketId: string }[]) => setOnlineUsers(users));
        return () => { socket.disconnect(); };
    }, [room.roomCode, token]);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    const send = (e: React.FormEvent) => {
        e.preventDefault();
        const text = input.trim();
        if (!text || !socketRef.current) return;
        socketRef.current.emit("send_message", { roomId: room._id, roomCode: room.roomCode, content: text });
        setInput("");
        inputRef.current?.focus();
    };

    return (
        <div style={{ display: "flex", flex: 1, height: "100%", overflow: "hidden" }}>
            <div style={{ width: 195, background: "#111", borderRight: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden" }}>
                <div style={{ height: 145, overflow: "hidden", flexShrink: 0 }}>
                    <img src={roomCover(room.name)} alt={room.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
                </div>
                <div style={{ padding: "12px 14px 6px" }}>
                    <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, margin: "0 0 5px" }}>{room.name}</p>
                    <p style={{ color: "rgba(255,255,255,.32)", fontSize: 11, margin: 0, lineHeight: 1.5 }}>A room to collaborate, code and vibe with your team.</p>
                </div>
                <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,.07)", margin: "10px 14px 6px" }} />
                <div style={{ flex: 1, overflowY: "auto", padding: "0 8px" }}>
                    {onlineUsers.length === 0
                        ? <p style={{ color: "rgba(255,255,255,.2)", fontSize: 11, padding: "6px 6px" }}>No one online…</p>
                        : onlineUsers.map((u, i) => {
                            const me = u.username === myUsername;
                            return (
                                <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, background: me ? "#16a34a" : "rgba(255,255,255,0.06)", borderRadius: 8, padding: "7px 9px", marginBottom: 5 }}>
                                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: `hsl(${u.username.charCodeAt(0) * 37},55%,50%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                                        {u.username.charAt(0).toUpperCase()}
                                    </div>
                                    <span style={{ color: "#fff", fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{u.username}</span>
                                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
                                </div>
                            );
                        })
                    }
                </div>
                <div style={{ padding: "8px 8px 18px" }}>
                    <button onClick={onBack} style={{ width: "100%", background: "rgba(180,30,30,.22)", border: "1px solid rgba(220,50,50,.35)", borderRadius: 8, color: "#f87171", padding: "10px 0", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                        Delete Room
                    </button>
                </div>
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
                <div style={{ height: 52, borderBottom: "1px solid rgba(255,255,255,.07)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0 }}>
                    <span style={{ color: "#fff", fontWeight: 600, fontSize: 15 }}>Chatbox</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 6, padding: "3px 10px", color: "rgba(255,255,255,.55)", fontSize: 12 }}>{room.name}</span>
                        <button type="button" onClick={() => setCodeOpen(v => !v)} style={{ background: codeOpen ? "rgba(124,58,237,.25)" : "rgba(255,255,255,.08)", border: codeOpen ? "1px solid rgba(124,58,237,.5)" : "1px solid rgba(255,255,255,.12)", borderRadius: 6, color: codeOpen ? "#c4b5fd" : "rgba(255,255,255,.6)", padding: "3px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all .2s" }}>
                            {codeOpen ? "✕ Code" : "</> Code"}
                        </button>
                    </div>
                </div>
                <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                    {loadingMsgs && <p style={{ color: "rgba(255,255,255,.22)", fontSize: 13, textAlign: "center", marginTop: 40 }}>Loading messages…</p>}
                    {!loadingMsgs && messages.length === 0 && (
                        <p style={{ color: "rgba(255,255,255,.18)", fontSize: 13, textAlign: "center", marginTop: 40 }}>
                            No messages yet — say something! 👋<br />
                            <span style={{ fontSize: 11, display: "block", marginTop: 6, color: "rgba(255,255,255,.1)" }}>Tip: say "@orbit" or "error" / "bug" to get AI help</span>
                        </p>
                    )}
                    {messages.map(msg => {
                        const name = resolveName(msg, idMap.current);
                        const mine = name === myUsername;
                        const orbit = name === "Orbit";
                        return (
                            <div key={msg._id} style={{ display: "flex", flexDirection: "column", alignItems: mine ? "flex-end" : "flex-start" }}>
                                <span style={{ fontSize: 10, marginBottom: 3, color: orbit ? "#a78bfa" : "rgba(255,255,255,.38)", fontWeight: orbit ? 700 : 400 }}>
                                    {orbit ? "🤖 Orbit AI" : name}
                                </span>
                                <div style={{ background: mine ? "#fff" : orbit ? "rgba(124,58,237,.18)" : "rgba(255,255,255,.07)", color: mine ? "#111" : "#fff", border: orbit ? "1px solid rgba(124,58,237,.4)" : "none", borderRadius: mine ? "14px 14px 4px 14px" : "4px 14px 14px 14px", padding: "9px 13px", fontSize: 13, maxWidth: 300, lineHeight: 1.55, wordBreak: "break-word" }}>
                                    {msg.content}
                                </div>
                                <span style={{ fontSize: 9, color: "rgba(255,255,255,.18)", marginTop: 3 }}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>
                            </div>
                        );
                    })}
                    <div ref={bottomRef} />
                </div>
                <form onSubmit={send} style={{ borderTop: "1px solid rgba(255,255,255,.07)", padding: "12px 16px", display: "flex", alignItems: "center", flexShrink: 0 }}>
                    <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} placeholder="Type Something....." style={{ flex: 1, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, padding: "11px 16px", color: "#fff", fontSize: 13, outline: "none", fontFamily: "inherit" }} />
                </form>
            </div>

            {codeOpen && (
                <CodeEditor roomCode={room.roomCode} socket={socketRef.current} />
            )}
        </div>
    );
}





function RoomCard({ room, onClick }: { room: Room; onClick: () => void }) {
    const [hov, setHov] = useState(false);
    const pal = ["#7c3aed", "#0ea5e9", "#f59e0b", "#10b981", "#ef4444", "#ec4899"];
    const cover = roomCover(room.name);
    return (
        <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={onClick}
            style={{ background: "#1a1a1a", border: `1px solid ${hov ? "rgba(255,255,255,.22)" : "rgba(255,255,255,.07)"}`, borderRadius: 12, overflow: "hidden", width: 180, cursor: "pointer", transition: "all .2s", transform: hov ? "translateY(-4px)" : "none", boxShadow: hov ? "0 16px 40px rgba(0,0,0,.5)" : "none" }}>
            <div style={{ height: 110, overflow: "hidden", position: "relative" }}>
                <img src={cover} alt={room.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
            </div>
            <div style={{ padding: "10px 12px 14px" }}>
                <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{room.name}</p>
                <p style={{ color: "rgba(255,255,255,.3)", fontSize: 11, margin: "0 0 10px", fontFamily: "monospace" }}>#{room.roomCode}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {[0, 1, 2].map(i => <div key={i} style={{ width: 18, height: 18, borderRadius: "50%", background: pal[(i + 2) % pal.length], border: "2px solid #1a1a1a", marginLeft: i === 0 ? 0 : -6 }} />)}
                    <span style={{ color: "rgba(255,255,255,.4)", fontSize: 11 }}>{room.members.length} Member{room.members.length !== 1 ? "s" : ""}</span>
                </div>
            </div>
        </div>
    );
}

function DashedCard({ label, onClick }: { label: string; onClick: () => void }) {
    const [hov, setHov] = useState(false);
    return (
        <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
            style={{ width: 180, height: 192, border: `2px dashed ${hov ? "rgba(255,255,255,.4)" : "rgba(255,255,255,.17)"}`, borderRadius: 12, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer", color: hov ? "rgba(255,255,255,.7)" : "rgba(255,255,255,.3)", fontSize: 13, fontWeight: 600, transition: "all .2s", background: hov ? "rgba(255,255,255,.03)" : "transparent", transform: hov ? "translateY(-4px)" : "none" }}>
            <span style={{ fontSize: 22 }}>+</span>
            <span>{label}</span>
        </div>
    );
}


const mT: React.CSSProperties = { color: "#fff", fontSize: 20, fontWeight: 700, margin: "0 0 6px" };
const mS: React.CSSProperties = { color: "rgba(255,255,255,.4)", fontSize: 12, margin: "0 0 20px" };
const ci: React.CSSProperties = { width: "100%", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, padding: "10px 12px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" };
const cl: React.CSSProperties = { display: "block", color: "rgba(255,255,255,.55)", fontSize: 12, marginBottom: 6 };

function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
    return (
        <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div onClick={e => e.stopPropagation()} style={{ background: "#161616", border: "1px solid rgba(255,255,255,.1)", borderRadius: 16, padding: "32px 28px", width: 360, boxShadow: "0 24px 80px rgba(0,0,0,.7)", position: "relative", animation: "fadeUp .22s ease" }}>
                {children}
            </div>
            <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>
        </div>
    );
}

function CreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: (r: Room) => void }) {
    const [name, setName] = useState(""); const [err, setErr] = useState(""); const [loading, setLoading] = useState(false);
    const submit = async (e: React.FormEvent) => {
        e.preventDefault(); setLoading(true); setErr("");
        try {
            const res = await fetch(`${API_BASE}/api/rooms/create`, { method: "POST", headers: hdrs(), body: JSON.stringify({ name }) });
            const data = await res.json();
            if (!res.ok) setErr(data?.message || "Failed"); else { onCreated(data.data); onClose(); }
        } catch { setErr("Network error"); } finally { setLoading(false); }
    };
    return (
        <Modal onClose={onClose}>
            <button onClick={onClose} style={{ position: "absolute", top: 14, right: 16, background: "none", border: "none", color: "rgba(255,255,255,.4)", fontSize: 20, cursor: "pointer" }}>×</button>
            <h2 style={mT}>Create a Room</h2><p style={mS}>Rooms auto-delete after 24 hrs of inactivity.</p>
            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div><label style={cl}>Room Name</label><input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Code Crushers" required style={ci} /></div>
                {err && <p style={{ color: "#f87171", fontSize: 12, margin: 0 }}>{err}</p>}
                <button type="submit" disabled={loading} style={{ background: loading ? "rgba(255,255,255,.5)" : "#fff", color: "#000", border: "none", borderRadius: 8, padding: "11px 0", fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer" }}>{loading ? "Creating…" : "Create Room"}</button>
            </form>
        </Modal>
    );
}

function JoinModal({ onClose, onJoined }: { onClose: () => void; onJoined: (r: Room) => void }) {
    const [code, setCode] = useState(""); const [err, setErr] = useState(""); const [loading, setLoading] = useState(false);
    const submit = async (e: React.FormEvent) => {
        e.preventDefault(); setLoading(true); setErr("");
        try {
            const res = await fetch(`${API_BASE}/api/rooms/join`, { method: "POST", headers: hdrs(), body: JSON.stringify({ roomCode: code.toUpperCase() }) });
            const data = await res.json();
            if (!res.ok) setErr(data?.message || "Room not found"); else { onJoined(data.data); onClose(); }
        } catch { setErr("Network error"); } finally { setLoading(false); }
    };
    return (
        <Modal onClose={onClose}>
            <button onClick={onClose} style={{ position: "absolute", top: 14, right: 16, background: "none", border: "none", color: "rgba(255,255,255,.4)", fontSize: 20, cursor: "pointer" }}>×</button>
            <h2 style={mT}>Join a Room</h2><p style={mS}>Enter the 6-character code from your friend.</p>
            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div><label style={cl}>Room Code</label><input value={code} onChange={e => setCode(e.target.value)} placeholder="AB12CD" maxLength={6} required style={{ ...ci, textTransform: "uppercase", letterSpacing: 4, fontWeight: 700 }} /></div>
                {err && <p style={{ color: "#f87171", fontSize: 12, margin: 0 }}>{err}</p>}
                <button type="submit" disabled={loading} style={{ background: loading ? "rgba(255,255,255,.5)" : "#fff", color: "#000", border: "none", borderRadius: 8, padding: "11px 0", fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer" }}>{loading ? "Joining…" : "Join Room"}</button>
            </form>
        </Modal>
    );
}


const NAV = ["Lobby", "Profile", "Settings", "Contact Us"] as const;
type Nav = typeof NAV[number];

function Sidebar({ active, setActive, onLogout }: { active: Nav; setActive: (n: Nav) => void; onLogout: () => void }) {
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


export default function Chatroom() {
    const navigate = useNavigate();
    const username = getUsername();
    const [nav, setNav] = useState<Nav>("Lobby");
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeRoom, setActiveRoom] = useState<Room | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [showJoin, setShowJoin] = useState(false);

    useEffect(() => { if (!getToken()) navigate("/"); }, [navigate]);

    const fetchRooms = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/rooms/my`, { headers: hdrs() });
            const data = await res.json();
            if (res.ok) setRooms(Array.isArray(data.data) ? data.data : []);
        } catch (err) {
            console.error("failed to load messages:", err);
        }
        finally { setLoading(false); }
    };
    useEffect(() => { fetchRooms(); }, []);

    const logout = () => {
        ["orbit_token", "orbit_username", "orbit_userId"].forEach(k => localStorage.removeItem(k));
        navigate("/");
    };

    return (
        <div style={{ display: "flex", height: "100vh", background: "#0d0d0d", fontFamily: "'Inter','Segoe UI',sans-serif", overflow: "hidden" }}>
            <Sidebar active={nav} setActive={n => { setNav(n); setActiveRoom(null); }} onLogout={logout} />

            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

                <header style={{ height: 58, borderBottom: "1px solid rgba(255,255,255,.07)", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 28px", gap: 12, flexShrink: 0 }}>
                    <span style={{ color: "rgba(255,255,255,.4)", fontSize: 14 }}>hie</span>
                    <span style={{ color: "#fff", fontWeight: 700, fontSize: 15, fontStyle: "italic" }}>{username}</span>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#db2777)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: "#fff" }}>
                        {username.charAt(0).toUpperCase()}
                    </div>
                </header>


                {nav === "Lobby" && !activeRoom && (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                        <div style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
                            {loading
                                ? <p style={{ color: "rgba(255,255,255,.3)", textAlign: "center", marginTop: 60, fontSize: 14 }}>Loading rooms…</p>
                                : <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-start" }}>
                                    {rooms.map(r => <RoomCard key={r._id} room={r} onClick={() => setActiveRoom(r)} />)}
                                    <DashedCard label="Create" onClick={() => setShowCreate(true)} />
                                    <DashedCard label="Join" onClick={() => setShowJoin(true)} />
                                </div>
                            }
                        </div>
                        <footer style={{ borderTop: "1px solid rgba(255,255,255,.07)", padding: "11px 32px", color: "rgba(255,255,255,.2)", fontSize: 11, flexShrink: 0 }}>
                            • groups with no members or inactivity will be deleted in 24hrs automatically
                        </footer>
                    </div>
                )}


                {nav === "Lobby" && activeRoom && (
                    <div style={{ flex: 1, display: "flex", overflow: "hidden", minWidth: 0 }}>
                        <ChatView room={activeRoom} onBack={() => setActiveRoom(null)} />
                    </div>
                )}


                {nav === "Profile" && (
                    <div style={{ padding: "28px 32px", color: "#fff", overflowY: "auto", flex: 1 }}>
                        <div style={{ background: "#1a1a1a", borderRadius: 16, border: "1px solid rgba(255,255,255,.08)", padding: "28px 32px", maxWidth: 760 }}>
                            <div style={{ display: "flex", gap: 28, alignItems: "flex-start", marginBottom: 28 }}>
                                <div style={{ width: 130, height: 130, borderRadius: 14, background: "linear-gradient(135deg,#7c3aed,#db2777)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52, fontWeight: 900, color: "#fff" }}>
                                    {username.charAt(0).toUpperCase()}
                                </div>
                                <div style={{ flex: 1, display: "flex", gap: 0, alignItems: "stretch" }}>
                                    <div style={{ flex: 1, paddingRight: 28 }}>
                                        <p style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px" }}>Hie, <span>{username}</span></p>
                                        <p style={{ color: "rgba(255,255,255,.45)", fontSize: 13, lineHeight: 1.65, margin: 0, maxWidth: 300 }}>
                                            Curious builder crafting intelligent developer tools, blending real-time collaboration, AI, and clean design to create meaningful tech experiences.
                                        </p>
                                    </div>
                                    <div style={{ width: 1, background: "rgba(255,255,255,.08)", flexShrink: 0 }} />
                                    <div style={{ paddingLeft: 28, display: "flex", flexDirection: "column", gap: 10, justifyContent: "center" }}>
                                        <p style={{ color: "rgba(255,255,255,.42)", fontSize: 13, margin: 0 }}>{username.toLowerCase()}@orbit.dev</p>
                                        <p style={{ color: "rgba(255,255,255,.42)", fontSize: 13, margin: 0 }}>India</p>
                                        <p style={{ color: "rgba(255,255,255,.42)", fontSize: 13, margin: 0 }}>Profile created on – {new Date().toLocaleDateString("en-IN")}</p>
                                    </div>
                                </div>
                            </div>
                            <p style={{ fontWeight: 700, fontSize: 18, margin: "0 0 16px" }}>Your Activity</p>
                            <div style={{ display: "flex", gap: 14, marginBottom: 28 }}>
                                {[
                                    { label: "Total Group\njoined", value: rooms.length },
                                    { label: "Total Time Spent\nin hr", value: Math.max(1, rooms.length * 2) },
                                    { label: "Total code lines\nwritten", value: rooms.length * 84 },
                                ].map(stat => (
                                    <div key={stat.label} style={{ flex: 1, background: "#111", border: "1px solid rgba(255,255,255,.07)", borderRadius: 12, padding: "16px 20px" }}>
                                        <p style={{ color: "rgba(255,255,255,.45)", fontSize: 12, whiteSpace: "pre-line", margin: "0 0 8px", lineHeight: 1.4 }}>{stat.label}</p>
                                        <p style={{ color: "#fff", fontSize: 42, fontWeight: 800, margin: 0, letterSpacing: -1 }}>{stat.value}</p>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: "flex", gap: 14 }}>
                                <button style={{ background: "rgba(180,30,30,.22)", border: "1px solid rgba(220,50,50,.35)", borderRadius: 10, color: "#f87171", padding: "10px 24px", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                                    Delete Account
                                </button>
                                <button style={{ background: "#fff", border: "none", borderRadius: 24, color: "#000", padding: "10px 36px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                                    Edit
                                </button>
                            </div>
                        </div>
                    </div>
                )}


                {nav === "Settings" && (
                    <div style={{ padding: 32, color: "#fff" }}>
                        <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 20 }}>Settings</h2>
                        <div style={{ background: "#1a1a1a", borderRadius: 14, padding: 28, border: "1px solid rgba(255,255,255,.08)", maxWidth: 440 }}>
                            <p style={{ color: "rgba(255,255,255,.4)", fontSize: 13 }}>Settings panel coming soon.</p>
                        </div>
                    </div>
                )}


                {nav === "Contact Us" && (
                    <div style={{ padding: 32, color: "#fff" }}>
                        <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 20 }}>Contact Us</h2>
                        <div style={{ background: "#1a1a1a", borderRadius: 14, padding: 28, border: "1px solid rgba(255,255,255,.08)", maxWidth: 440 }}>
                            <p style={{ color: "rgba(255,255,255,.4)", fontSize: 13 }}>Reach us at <span style={{ color: "#7c3aed" }}>support@orbit.dev</span></p>
                        </div>
                    </div>
                )}
            </div>

            {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreated={r => { setRooms(p => [...p, r]); setActiveRoom(r); }} />}
            {showJoin && <JoinModal onClose={() => setShowJoin(false)} onJoined={r => { setRooms(p => p.find(x => x._id === r._id) ? p : [...p, r]); setActiveRoom(r); }} />}
        </div>
    );
}
