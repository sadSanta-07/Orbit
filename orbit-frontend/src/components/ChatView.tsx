import { useEffect, useRef, useState } from "react";
import { type Room, getUsername, getToken, resolveName } from "../chatroom/types";
import { roomCover } from "../utils";
import { useMessages } from "../chatroom/hooks/useMessages";
import { useSocket } from "../chatroom/hooks/useSocket";
import CodeEditor from "./CodeEditor";

export default function ChatView({ room, onBack }: { room: Room; onBack: () => void }) {
    const myUsername = getUsername();
    const token = getToken();

    const { messages, loading: loadingMsgs, idMap, addMessage } = useMessages(room._id);
    const { socketRef, onlineUsers, sendMessage } = useSocket({ roomCode: room.roomCode, token, onMessage: addMessage });

    const [input, setInput] = useState("");
    const [codeOpen, setCodeOpen] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    const send = (e: React.FormEvent) => {
        e.preventDefault();
        const text = input.trim();
        if (!text) return;
        sendMessage({ roomId: room._id, roomCode: room.roomCode, content: text });
        setInput("");
        inputRef.current?.focus();
    };

    return (
        <div style={{ display: "flex", flex: 1, height: "100%", overflow: "hidden" }}>
            {/* Left sidebar — room info + online users */}
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
                        : onlineUsers.map((u, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, background: u.username === myUsername ? "#16a34a" : "rgba(255,255,255,0.06)", borderRadius: 8, padding: "7px 9px", marginBottom: 5 }}>
                                <div style={{ width: 28, height: 28, borderRadius: "50%", background: `hsl(${u.username.charCodeAt(0) * 37},55%,50%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                                    {u.username.charAt(0).toUpperCase()}
                                </div>
                                <span style={{ color: "#fff", fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{u.username}</span>
                                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
                            </div>
                        ))
                    }
                </div>
                <div style={{ padding: "8px 8px 18px" }}>
                    <button onClick={onBack} style={{ width: "100%", background: "rgba(180,30,30,.22)", border: "1px solid rgba(220,50,50,.35)", borderRadius: 8, color: "#f87171", padding: "10px 0", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                        Delete Room
                    </button>
                </div>
            </div>

            {/* Chat area */}
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
                        const name = resolveName(msg, idMap);
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

            {codeOpen && <CodeEditor roomCode={room.roomCode} socket={socketRef.current} />}
        </div>
    );
}