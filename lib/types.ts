export interface Tutor {
    _id: string;
    name: string;
    subject: string;
    description: string;
    avatarUrl?: string;
}

export interface Chat {
    _id: string;
    tutorId: string;
    title?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ChatMessage {
    _id: string;
    chatId: string;
    content: string;
    role: "user" | "assistant";
    createdAt: string;
}
