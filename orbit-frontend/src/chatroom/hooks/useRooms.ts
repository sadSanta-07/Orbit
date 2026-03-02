import { useState, useEffect } from "react";
import { type Room, hdrs } from "../types";
import { API_BASE } from "../constants";

export function useRooms() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRooms = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/rooms/my`, { headers: hdrs() });
            const data = await res.json();
            if (res.ok) setRooms(Array.isArray(data.data) ? data.data : []);
        } catch (err) {
            console.error("Failed to load rooms:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRooms(); }, []);

    const addRoom = (room: Room) =>
        setRooms(prev => prev.find(r => r._id === room._id) ? prev : [...prev, room]);

    const removeRoom = (roomId: string) =>
        setRooms(prev => prev.filter(r => r._id !== roomId));

    return { rooms, loading, addRoom, removeRoom };
}