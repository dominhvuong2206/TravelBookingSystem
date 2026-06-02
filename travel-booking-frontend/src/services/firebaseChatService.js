import { off, onValue, push, ref, update } from "firebase/database";
import { realtimeDb } from "../configs/firebase";

export const getDisplayName = user => `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || user?.username || "Người dùng";

export const getChatRoomId = (chatRequest, currentUser) => {
    if (!chatRequest || !currentUser)
        return "";

    if (chatRequest.type === "booking")
        return `booking_${chatRequest.booking.id}`;

    const service = chatRequest.service;
    const provider = service?.providerId;
    if (!service || !provider)
        return "";

    return `service_${service.id}_customer_${currentUser.id}_provider_${provider.id}`;
};

export const buildRoomPayload = (chatRequest, currentUser) => {
    const service = chatRequest.type === "booking"
        ? chatRequest.booking?.serviceId
        : chatRequest.service;
    const customer = chatRequest.type === "booking"
        ? chatRequest.booking?.customerId
        : currentUser;
    const provider = service?.providerId;

    if (!service || !customer || !provider)
        return null;

    return {
        bookingId: chatRequest.type === "booking" ? chatRequest.booking.id : null,
        serviceId: service.id,
        serviceName: chatRequest.booking?.serviceNameSnapshot || service.name || "",
        customerId: customer.id,
        customerName: getDisplayName(customer),
        providerId: provider.id,
        providerName: getDisplayName(provider),
    };
};

export const ensureChatRoom = async (chatRequest, currentUser) => {
    const roomId = getChatRoomId(chatRequest, currentUser);
    const payload = buildRoomPayload(chatRequest, currentUser);
    const now = Date.now();

    if (!roomId || !payload)
        throw new Error("Không đủ dữ liệu để tạo phòng chat.");

    await update(ref(realtimeDb, `directChats/${roomId}`), {
        ...payload,
        updatedAt: now,
        createdAt: now,
    });

    return { id: roomId, ...payload, updatedAt: now, createdAt: now };
};

export const listenChatRooms = (currentUser, role, onData, onError) => {
    const roomsRef = ref(realtimeDb, "directChats");
    const unsubscribe = onValue(roomsRef, snapshot => {
        const data = snapshot.val() || {};
        const rooms = Object.entries(data)
            .map(([id, value]) => ({ id, ...value }))
            .filter(room => role === "ROLE_PROVIDER"
                ? String(room.providerId) === String(currentUser.id)
                : String(room.customerId) === String(currentUser.id))
            .sort((a, b) => Number(b.lastMessageAt || b.updatedAt || 0) - Number(a.lastMessageAt || a.updatedAt || 0));

        onData(rooms);
    }, onError);

    return () => {
        off(roomsRef);
        unsubscribe?.();
    };
};

export const listenChatMessages = (roomId, onData, onError) => {
    const messagesRef = ref(realtimeDb, `directChats/${roomId}/messages`);
    const unsubscribe = onValue(messagesRef, snapshot => {
        const data = snapshot.val() || {};
        const messages = Object.entries(data)
            .map(([id, value]) => ({ id, ...value }))
            .sort((a, b) => Number(a.createdAt || 0) - Number(b.createdAt || 0));

        onData(messages);
    }, onError);

    return () => {
        off(messagesRef);
        unsubscribe?.();
    };
};

export const sendChatMessage = async (room, currentUser, role, text) => {
    const trimmed = text.trim();
    if (!room?.id || !trimmed)
        throw new Error("Tin nhắn không hợp lệ.");

    const messageRef = push(ref(realtimeDb, `directChats/${room.id}/messages`));
    const messageId = messageRef.key;
    const now = Date.now();

    const message = {
        text: trimmed,
        senderId: String(currentUser.id),
        senderName: getDisplayName(currentUser),
        senderRole: role,
        createdAt: now,
    };

    await update(ref(realtimeDb), {
        [`directChats/${room.id}/messages/${messageId}`]: message,
        [`directChats/${room.id}/lastMessage`]: trimmed,
        [`directChats/${room.id}/lastMessageAt`]: now,
        [`directChats/${room.id}/updatedAt`]: now,
    });

    return { id: messageId, ...message };
};
