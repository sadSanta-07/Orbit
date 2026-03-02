import type { Room } from "../chatroom/types";
import { RoomCard, DashedCard } from "../components/RoomCard";

interface LobbyPageProps {
    rooms: Room[];
    loading: boolean;
    onRoomClick: (room: Room) => void;
    onCreateClick: () => void;
    onJoinClick: () => void;
    onDelete: (roomId: string) => void;
    currentUserId: string;
}

export default function LobbyPage({ rooms, loading, onRoomClick, onCreateClick, onJoinClick, onDelete, currentUserId }: LobbyPageProps) {
    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
                {loading
                    ? <p style={{ color: "rgba(255,255,255,.3)", textAlign: "center", marginTop: 60, fontSize: 14 }}>Loading rooms…</p>
                    : (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-start" }}>
                            {rooms.map(r => (
                                <RoomCard
                                    key={r._id}
                                    room={r}
                                    onClick={() => onRoomClick(r)}
                                    onDeleted={onDelete}
                                    currentUserId={currentUserId}
                                />
                            ))}
                            <DashedCard label="Create" onClick={onCreateClick} />
                            <DashedCard label="Join" onClick={onJoinClick} />
                        </div>
                    )
                }
            </div>
            <footer style={{ borderTop: "1px solid rgba(255,255,255,.07)", padding: "11px 32px", color: "rgba(255,255,255,.2)", fontSize: 11, flexShrink: 0 }}>
                • groups with no members or inactivity will be deleted in 24hrs automatically
            </footer>
        </div>
    );
}
