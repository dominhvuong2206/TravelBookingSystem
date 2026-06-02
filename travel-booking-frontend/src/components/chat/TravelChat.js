import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";
import "moment/locale/vi";
import { MyUserContext } from "../../configs/Contexts";
import { normalizeRole } from "../../utils/authUtils";
import {
    ensureChatRoom,
    listenChatMessages,
    listenChatRooms,
    sendChatMessage,
} from "../../services/firebaseChatService";
import styles from "./TravelChatStyle";

moment.locale("vi");

const initials = name => (name || "?").trim().charAt(0).toUpperCase();
const timeText = value => value ? moment(value).format("HH:mm") : "";

const TravelChat = ({ chatRequest, onHandled }) => {
    const [user] = useContext(MyUserContext);
    const [open, setOpen] = useState(false);
    const [rooms, setRooms] = useState([]);
    const [activeRoomId, setActiveRoomId] = useState("");
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [kw, setKw] = useState("");
    const [notice, setNotice] = useState("");
    const [connecting, setConnecting] = useState(false);
    const [sending, setSending] = useState(false);
    const bottomRef = useRef(null);
    const role = normalizeRole(user);

    useEffect(() => {
        if (!user || role === "ROLE_ADMIN")
            return undefined;

        return listenChatRooms(
            user,
            role,
            data => {
                setRooms(data);
                setNotice("");
                if (!activeRoomId && data.length > 0)
                    setActiveRoomId(data[0].id);
            },
            () => setNotice("Không thể tải hội thoại. Vui lòng thử lại.")
        );
    }, [activeRoomId, role, user]);

    useEffect(() => {
        if (!activeRoomId) {
            setMessages([]);
            return undefined;
        }

        return listenChatMessages(
            activeRoomId,
            data => {
                setMessages(data);
                setNotice("");
            },
            () => setNotice("Không thể tải tin nhắn. Vui lòng thử lại.")
        );
    }, [activeRoomId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, open]);

    useEffect(() => {
        const openRequestedRoom = async () => {
            if (!chatRequest || !user)
                return;

            setOpen(true);
            setConnecting(true);
            setNotice("");

            try {
                const room = await ensureChatRoom(chatRequest, user);
                setRooms(current => {
                    const existed = current.some(item => item.id === room.id);
                    return existed
                        ? current.map(item => item.id === room.id ? { ...item, ...room } : item)
                        : [room, ...current];
                });
                setActiveRoomId(room.id);
                onHandled?.();
            } catch (err) {
                setNotice("Không thể mở hội thoại. Vui lòng thử lại.");
            } finally {
                setConnecting(false);
            }
        };

        openRequestedRoom();
    }, [chatRequest, user, onHandled]);

    const activeRoom = useMemo(
        () => rooms.find(room => room.id === activeRoomId) || null,
        [rooms, activeRoomId]
    );

    const visibleRooms = rooms.filter(room => {
        const keyword = kw.trim().toLowerCase();
        if (!keyword)
            return true;

        return [room.providerName, room.customerName, room.serviceName, room.lastMessage]
            .filter(Boolean)
            .some(value => value.toLowerCase().includes(keyword));
    });

    if (!user || role === "ROLE_ADMIN")
        return null;

    const partnerName = room => role === "ROLE_PROVIDER" ? room.customerName : room.providerName;

    const send = async () => {
        const trimmed = text.trim();
        if (!trimmed || !activeRoom || sending)
            return;

        setSending(true);
        setNotice("");

        try {
            await sendChatMessage(activeRoom, user, role, trimmed);
            setText("");
        } catch (err) {
            setNotice("Không gửi được tin nhắn. Vui lòng thử lại.");
        } finally {
            setSending(false);
        }
    };

    const onKeyDown = e => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    if (!open) {
        return (
            <button type="button" style={styles.launcher} onClick={() => setOpen(true)}>
                <FontAwesomeIcon icon="fa-solid fa-comment-dots" />
                Chat
            </button>
        );
    }

    return (
        <>
            <style>{styles.responsive}</style>
            <section className="travel-chat-panel" style={styles.panel}>
                <aside style={styles.sidebar} className={activeRoom ? "travel-chat-sidebar-hidden" : ""}>
                    <div style={styles.sidebarHeader}>
                        <span>Chat</span>
                        <button type="button" style={styles.headerButton} onClick={() => setOpen(false)}>
                            <FontAwesomeIcon icon="fa-solid fa-xmark" />
                        </button>
                    </div>
                    <div style={styles.searchBox}>
                        <input
                            style={styles.searchInput}
                            placeholder="Tìm hội thoại"
                            value={kw}
                            onChange={e => setKw(e.target.value)}
                        />
                    </div>
                    <div style={styles.roomList}>
                        {visibleRooms.length === 0 && (
                            <div style={styles.empty}>
                                {connecting ? "Đang tạo hội thoại..." : "Chưa có hội thoại nào."}
                            </div>
                        )}
                        {visibleRooms.map(room => (
                            <button
                                key={room.id}
                                type="button"
                                style={styles.roomItem(room.id === activeRoomId)}
                                onClick={() => setActiveRoomId(room.id)}
                            >
                                <div style={styles.avatar}>{initials(partnerName(room))}</div>
                                <div style={styles.roomMeta}>
                                    <div style={styles.roomTop}>
                                        <div style={styles.roomName}>{partnerName(room)}</div>
                                        <div style={styles.roomTime}>{timeText(room.lastMessageAt || room.updatedAt)}</div>
                                    </div>
                                    <div style={styles.roomService}>{room.serviceName}</div>
                                    <div style={styles.roomLast}>{room.lastMessage || "Chưa có tin nhắn"}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </aside>

                <main style={styles.chat}>
                    {activeRoom ? (
                        <>
                            <div style={styles.chatHeader}>
                                <div style={styles.avatar}>{initials(partnerName(activeRoom))}</div>
                                <div>
                                    <div style={styles.chatTitle}>{partnerName(activeRoom)}</div>
                                    <div style={styles.chatSub}>{activeRoom.serviceName}</div>
                                </div>
                            </div>
                            <div style={styles.messages}>
                                {notice && <div className="alert alert-warning py-2 px-3 mb-2">{notice}</div>}
                                {messages.length === 0 && (
                                    <div style={styles.empty}>
                                        {connecting ? "Đang kết nối..." : "Bắt đầu trao đổi với nhà cung cấp về dịch vụ này."}
                                    </div>
                                )}
                                {messages.map(message => {
                                    const mine = message.senderId === String(user.id);
                                    return (
                                        <div key={message.id} style={styles.messageWrap(mine)}>
                                            {!mine && <div style={styles.sender}>{message.senderName}</div>}
                                            <div style={styles.bubble(mine)}>{message.text}</div>
                                            <div style={styles.msgTime(mine)}>{timeText(message.createdAt)}</div>
                                        </div>
                                    );
                                })}
                                <div ref={bottomRef} />
                            </div>
                            <div style={styles.inputRow}>
                                <textarea
                                    rows={1}
                                    style={styles.input}
                                    placeholder="Nhập tin nhắn..."
                                    value={text}
                                    onChange={e => setText(e.target.value)}
                                    onKeyDown={onKeyDown}
                                    disabled={sending || connecting}
                                />
                                <button type="button" style={styles.send} onClick={send} disabled={sending || connecting}>
                                    <FontAwesomeIcon icon={sending ? "fa-solid fa-spinner" : "fa-solid fa-paper-plane"} spin={sending} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div style={styles.empty}>
                            {notice || (connecting ? "Đang tạo hội thoại..." : "Chọn một hội thoại để bắt đầu.")}
                        </div>
                    )}
                </main>
            </section>
        </>
    );
};

export default TravelChat;
