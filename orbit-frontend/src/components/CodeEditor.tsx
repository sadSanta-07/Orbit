import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { Socket } from "socket.io-client";
import type { Op, CursorInfo, PixelPos } from "../chatroom/types";
import { LANGUAGES, API_BASE } from "../chatroom/constants";
import { computeOp, applyOp, shiftCursor, curCol } from "../utils";
import { hdrs, getUsername } from "../chatroom/types";

interface CodeEditorProps {
    roomCode: string;
    socket: Socket | null;
}

export default function CodeEditor({ roomCode, socket }: CodeEditorProps) {
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
    const pendingCursor = useRef<{ start: number; end: number } | null>(null);

    useLayoutEffect(() => {
        if (pendingCursor.current && taRef.current) {
            taRef.current.selectionStart = pendingCursor.current.start;
            taRef.current.selectionEnd = pendingCursor.current.end;
            pendingCursor.current = null;
            suppressSync.current = false;
        }
    });

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
        const handle = ({ op, code: incoming, cursorPos, username: senderName }: { op?: Op; code?: string; cursorPos?: number; username?: string }) => {
            if (senderName === myUsername) return;

            if (cursorPos !== undefined && senderName) {
                setRemoteCursors(rc => {
                    const next = new Map(rc);
                    next.set(senderName, { pos: cursorPos, color: curCol(senderName) });
                    return next;
                });
            }

            const ta = taRef.current;

            if (op) {
                const savedStart = ta?.selectionStart ?? 0;
                const savedEnd = ta?.selectionEnd ?? savedStart;
                suppressSync.current = true;
                setCode(curr => applyOp(curr, op));
                pendingCursor.current = { start: shiftCursor(savedStart, op), end: shiftCursor(savedEnd, op) };
            } else if (incoming && incoming !== codeRef.current) {
                const prevCode = codeRef.current;
                const savedStart = ta?.selectionStart ?? 0;
                const savedEnd = ta?.selectionEnd ?? savedStart;
                suppressSync.current = true;
                setCode(incoming);
                const delta = incoming.length - prevCode.length;
                let changeAt = 0;
                const minLen = Math.min(incoming.length, prevCode.length);
                while (changeAt < minLen && incoming[changeAt] === prevCode[changeAt]) changeAt++;
                pendingCursor.current = {
                    start: changeAt <= savedStart ? Math.max(0, Math.min(savedStart + delta, incoming.length)) : Math.min(savedStart, incoming.length),
                    end: changeAt <= savedEnd ? Math.max(0, Math.min(savedEnd + delta, incoming.length)) : Math.min(savedEnd, incoming.length),
                };
            }
        };
        socket.on("sync_code", handle);
        socket.on("code_change", handle);
        return () => { socket.off("sync_code", handle); socket.off("code_change", handle); };
    }, [socket, myUsername]);

    const emitChange = useCallback((newCode: string) => {
        if (!socket || suppressSync.current) return;
        const pos = taRef.current?.selectionStart ?? 0;
        const op = computeOp(codeRef.current, newCode);
        socket.emit("code_change", { roomCode, op, code: newCode, cursorPos: pos, username: myUsername });
    }, [socket, roomCode, myUsername]);

    const emitCursor = useCallback(() => {
        if (!socket) return;
        const pos = taRef.current?.selectionStart ?? 0;
        socket.emit("code_change", { roomCode, cursorPos: pos, username: myUsername });
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
        if (e.key === "Escape") emitChange(code);
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
            <style>{`@keyframes cursorBlink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>

            {/* Header */}
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

            {/* Editor body */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <div ref={wrapperRef} style={{ position: "relative", flex: output ? "0 0 60%" : 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    <div ref={mirrorRef} aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, width: "100%", padding: "16px 20px", fontSize: 13.5, boxSizing: "border-box", fontFamily: "'Fira Code','Cascadia Code','Consolas','Courier New',monospace", lineHeight: 1.65, whiteSpace: "pre-wrap", wordBreak: "break-word", visibility: "hidden", pointerEvents: "none", zIndex: 0 }} />

                    {Array.from(cursorPixels.entries()).map(([username, { x, y }]) => {
                        const info = remoteCursors.get(username);
                        if (!info) return null;
                        return (
                            <div key={username} style={{ position: "absolute", left: x, top: y, width: 2, height: lineHeightPx, background: info.color, zIndex: 10, pointerEvents: "all", cursor: "default", animation: "cursorBlink 1s step-end infinite" }}
                                onMouseEnter={() => setHoveredCursor(username)}
                                onMouseLeave={() => setHoveredCursor(null)}
                            >
                                {hoveredCursor === username && (
                                    <div style={{ position: "absolute", bottom: "100%", left: 0, background: info.color, color: "#000", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: "4px 4px 4px 0", whiteSpace: "nowrap", marginBottom: 2, pointerEvents: "none" }}>
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
                        style={{ flex: 1, background: "#111", color: "#e2e8f0", border: "none", outline: "none", resize: "none", padding: "16px 20px", fontSize: 13.5, fontFamily: "'Fira Code','Cascadia Code','Consolas','Courier New',monospace", lineHeight: 1.65, tabSize: 4, transition: "flex .2s", position: "relative", zIndex: 1 }}
                    />
                </div>

                {output && (
                    <div style={{ flex: 1, borderTop: "1px solid rgba(255,255,255,0.07)", background: "#0a0a0a", padding: "12px 20px", overflowY: "auto", minHeight: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                            <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>Output</span>
                            <button onClick={() => setOutput("")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 16, cursor: "pointer", lineHeight: 1 }}>×</button>
                        </div>
                        <pre style={{ color: "#4ade80", fontFamily: "monospace", fontSize: 13, margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{output}</pre>
                    </div>
                )}
            </div>

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "8px 20px", color: "rgba(255,255,255,0.2)", fontSize: 11, display: "flex", justifyContent: "flex-end", flexShrink: 0 }}>
                • press esc for exit ( code will be saved auto )
            </div>
        </div>
    );
}