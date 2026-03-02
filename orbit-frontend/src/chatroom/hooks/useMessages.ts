import { useState, useEffect, useRef } from "react";
import { type Msg, hdrs } from "../types";
import { API_BASE } from "../constants";

export function useMessages(roomId: string) {
    const [messages, setMessages] = useState<Msg[]>([]);
    const [loading, setLoading] = useState(true);
    const seenIds = useRef<Set<string>>(new Set());
    const idMap = useRef<Map<string, string>>(new Map());

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE}/api/messages/${roomId}`, { headers: hdrs() });
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
            finally { setLoading(false); }
        };
        load();
    }, [roomId]);

    const addMessage = (msg: Msg) => {
        if (seenIds.current.has(msg._id)) return;
        seenIds.current.add(msg._id);
        setMessages(prev => [...prev, msg]);
    };

    return { messages, loading, idMap: idMap.current, addMessage };
}