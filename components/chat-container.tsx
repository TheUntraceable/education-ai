"use client";

import type React from "react";

import { EmptyState } from "@/components/empty-state";
import { MessageItem } from "@/components/message-item";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useMobile } from "@/hooks/use-mobile";
import { useSearchParamsClient } from "@/hooks/use-search-params-client";
import { useToast } from "@/hooks/use-toast";
import type { ChatMessage, Tutor } from "@/lib/types";
import {
    ArrowUp,
    GraduationCap,
    Menu,
    MessageSquare,
    PlusCircle,
    Send,
    Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function ChatContainer() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [tutor, setTutor] = useState<Tutor | null>(null);
    const [editingMessage, setEditingMessage] = useState<string | null>(null);
    const [messageHistory, setMessageHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [streamingContent, setStreamingContent] = useState("");
    const { selectedTutor, selectedChat } = useSearchParamsClient();
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isMobile = useMobile();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (selectedTutor) {
            fetchTutor(selectedTutor);
        }
    }, [selectedTutor]);

    useEffect(() => {
        if (selectedChat) {
            fetchMessages({ chatId: selectedChat, showRefetching: true });
        } else {
            setMessages([]);
        }
    }, [selectedChat]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, streamingContent]);

    const fetchTutor = async (tutorId: string) => {
        try {
            const response = await fetch(`/api/tutors/${tutorId}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch tutor: ${response.status}`);
            }
            const data = await response.json();
            setTutor(data);
        } catch (error) {
            console.error("Error fetching tutor:", error);
            toast({
                title: "Error",
                description: "Failed to load tutor information",
                variant: "destructive",
            });
        }
    };

    const fetchMessages = async ({
        chatId,
        showRefetching = false,
    }: {
        chatId: string;
        showRefetching: boolean;
    }) => {
        if (!chatId) return;
        if (showRefetching) {
            setLoadingMessages(true);
        }
        try {
            const response = await fetch(`/api/messages?chatId=${chatId}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch messages: ${response.status}`);
            }
            const data = await response.json();
            setMessages(data);
        } catch (error) {
            console.error("Error fetching messages:", error);
            toast({
                title: "Error",
                description: "Failed to load messages",
                variant: "destructive",
            });
        } finally {
            setLoadingMessages(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();

        if (!input.trim() || !selectedTutor || !selectedChat) return;

        const messageContent = input;
        setInput("");
        setHistoryIndex(-1);
        setEditingMessage(null);
        setStreamingContent("");

        // Add to message history
        setMessageHistory((prev) => [messageContent, ...prev.slice(0, 49)]);

        // Optimistically add user message
        const tempId = `temp-${Date.now()}`;
        const userMessage: ChatMessage = {
            _id: tempId,
            chatId: selectedChat,
            content: messageContent,
            role: "user",
            createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);

        // Send message to API
        setLoading(true);
        try {
            console.log("Sending message:", {
                chatId: selectedChat,
                content: messageContent,
                tutorId: selectedTutor,
            });

            const response = await fetch("/api/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    chatId: selectedChat,
                    content: messageContent,
                    tutorId: selectedTutor,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || `Server error: ${response.status}`,
                );
            }

            // Handle streaming response
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) {
                throw new Error("Failed to get response reader");
            }

            // Create a temporary message for streaming content
            const streamingId = `streaming-${Date.now()}`;
            const streamingMessage: ChatMessage = {
                _id: streamingId,
                chatId: selectedChat,
                content: "",
                role: "assistant",
                createdAt: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, streamingMessage]);

            let accumulatedContent = "";

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    break;
                }

                // Decode and accumulate the chunk
                const chunk = decoder.decode(value, { stream: true });
                accumulatedContent += chunk;

                // Update the streaming message
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg._id === streamingId
                            ? { ...msg, content: accumulatedContent }
                            : msg,
                    ),
                );
            }
            setStreamingContent(accumulatedContent);
            fetchMessages({ chatId: selectedChat, showRefetching: false }); // Re-enable fetching messages after streaming
        } catch (error) {
            console.error("Error sending message:", error);
            toast({
                title: "Error sending message",
                description:
                    (error as Error).message ||
                    "Failed to send message. Please try again.",
                variant: "destructive",
            });

            // Remove the optimistic user message and streaming message if there was an error
            setMessages((prev) =>
                prev.filter(
                    (msg) =>
                        !msg._id.startsWith("temp-") &&
                        !msg._id.startsWith("streaming-"),
                ),
            );
        } finally {
            setLoading(false);
            setStreamingContent("");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Handle up arrow for message history
        if (e.key === "ArrowUp" && !e.shiftKey && input === "") {
            e.preventDefault();
            if (
                messageHistory.length > 0 &&
                historyIndex < messageHistory.length - 1
            ) {
                const newIndex = historyIndex + 1;
                setHistoryIndex(newIndex);
                setInput(messageHistory[newIndex]);
            }
        }

        // Handle down arrow for message history
        if (e.key === "ArrowDown" && !e.shiftKey && historyIndex >= 0) {
            e.preventDefault();
            if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                setInput(messageHistory[newIndex]);
            } else {
                setHistoryIndex(-1);
                setInput("");
            }
        }

        // Handle enter for submit (but allow shift+enter for new line)
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleEditMessage = (messageId: string, content: string) => {
        setEditingMessage(messageId);
        setInput(content);
        inputRef.current?.focus();
    };

    const handleRerunMessage = async (messageIndex: number) => {
        if (!selectedChat || !selectedTutor) return;

        // Find the message and all messages before it
        const messagesToKeep = messages.slice(0, messageIndex);
        const messageToRerun = messages[messageIndex];

        if (messageToRerun.role !== "user") return;

        // Update UI to show only messages up to the selected one
        setMessages(messagesToKeep);
        setStreamingContent("");

        // Re-send the message
        setLoading(true);
        try {
            const response = await fetch("/api/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    chatId: selectedChat,
                    content: messageToRerun.content,
                    tutorId: selectedTutor,
                    rerun: true,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || `Server error: ${response.status}`,
                );
            }

            // Add the user message back
            setMessages((prev) => [...prev, messageToRerun]);

            // Handle streaming response
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) {
                throw new Error("Failed to get response reader");
            }

            // Create a temporary message for streaming content
            const streamingId = `streaming-${Date.now()}`;
            const streamingMessage: ChatMessage = {
                _id: streamingId,
                chatId: selectedChat,
                content: "",
                role: "assistant",
                createdAt: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, streamingMessage]);

            let accumulatedContent = "";

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    break;
                }

                // Decode and accumulate the chunk
                const chunk = decoder.decode(value, { stream: true });
                accumulatedContent += chunk;

                // Update the streaming message
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg._id === streamingId
                            ? { ...msg, content: accumulatedContent }
                            : msg,
                    ),
                );
            }

            // After streaming is complete, the message is already saved to the database by the API
            // Refresh messages to get the proper ID
            fetchMessages({ chatId: selectedChat, showRefetching: false });
        } catch (error) {
            console.error("Error rerunning message:", error);
            toast({
                title: "Error",
                description: "Failed to rerun message. Please try again.",
                variant: "destructive",
            });

            // Restore the messages if there was an error
            setMessages((prev) => [...prev, messageToRerun]);
        } finally {
            setLoading(false);
            setStreamingContent("");
        }
    };

    const clearChat = async () => {
        if (!selectedChat) return;

        if (!confirm("Are you sure you want to clear this chat?")) return;

        try {
            const response = await fetch(
                `/api/messages?chatId=${selectedChat}`,
                {
                    method: "DELETE",
                },
            );

            if (!response.ok) {
                throw new Error("Failed to clear chat");
            }

            setMessages([]);
            toast({
                title: "Chat cleared",
                description: "All messages have been removed from this chat.",
            });
        } catch (error) {
            console.error("Error clearing chat:", error);
            toast({
                title: "Error",
                description: "Failed to clear chat. Please try again.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="flex-1 flex flex-col h-screen">
            <header className="border-b p-4 flex items-center justify-between">
                {isMobile && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                )}

                <div className="flex-1 flex items-center">
                    {tutor ? (
                        <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                                <GraduationCap className="h-4 w-4" />
                            </div>
                            <div>
                                <h2 className="font-medium">{tutor.name}</h2>
                                <p className="text-xs text-muted-foreground">
                                    {tutor.subject}
                                </p>
                            </div>
                        </div>
                    ) : selectedTutor ? (
                        <Skeleton className="h-8 w-40" />
                    ) : (
                        <h2 className="font-medium">Select a tutor to start</h2>
                    )}
                </div>

                {selectedChat && messages.length > 0 && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={clearChat}
                        title="Clear chat"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
            </header>

            <ScrollArea className="flex-1 p-4">
                {loadingMessages ? (
                    <div className="space-y-4">
                        {Array(3)
                            .fill(0)
                            .map((_, i) => (
                                <div key={i} className="flex flex-col gap-2">
                                    <Skeleton className="h-6 w-20" />
                                    <Skeleton className="h-24 w-full" />
                                </div>
                            ))}
                    </div>
                ) : selectedChat && messages.length > 0 ? (
                    <div className="space-y-6">
                        {messages.map((message, index) => (
                            <MessageItem
                                key={message._id}
                                message={message}
                                onEdit={handleEditMessage}
                                onRerun={() => handleRerunMessage(index)}
                                isLastUserMessage={
                                    message.role === "user" &&
                                    index ===
                                        messages.findLastIndex(
                                            (m) => m.role === "user",
                                        )
                                }
                                isStreaming={message._id.startsWith(
                                    "streaming-",
                                )}
                            />
                        ))}
                        {loading &&
                            !messages.some((msg) =>
                                msg._id.startsWith("streaming-"),
                            ) && (
                                <div className="flex items-center justify-center py-4">
                                    <div className="animate-pulse flex space-x-2">
                                        <div className="h-2 w-2 bg-primary rounded-full"></div>
                                        <div className="h-2 w-2 bg-primary rounded-full"></div>
                                        <div className="h-2 w-2 bg-primary rounded-full"></div>
                                    </div>
                                </div>
                            )}
                        <div ref={messagesEndRef} />
                    </div>
                ) : selectedChat ? (
                    <EmptyState
                        title="Start a conversation"
                        description="Send a message to begin chatting with your tutor."
                        icon={<MessageSquare className="h-12 w-12" />}
                    />
                ) : selectedTutor ? (
                    <EmptyState
                        title="Create a new chat"
                        description="Start a new conversation with this tutor."
                        icon={<PlusCircle className="h-12 w-12" />}
                    />
                ) : (
                    <EmptyState
                        title="Welcome to Education AI"
                        description="Select a tutor from the sidebar to get started."
                        icon={<GraduationCap className="h-12 w-12" />}
                    />
                )}
            </ScrollArea>

            {selectedChat && (
                <div className="border-t p-4">
                    <form
                        onSubmit={handleSubmit}
                        className="flex items-end gap-2"
                    >
                        <Textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type your message..."
                            className="min-h-24 resize-none"
                            disabled={loading}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={!input.trim() || loading}
                        >
                            {editingMessage ? (
                                <ArrowUp className="h-4 w-4" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </Button>
                    </form>
                    <div className="mt-2 text-xs text-muted-foreground">
                        Press Enter to send, Shift+Enter for new line, ↑ to edit
                        last message
                    </div>
                </div>
            )}

            {isMobile && (
                <MobileSidebar
                    open={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
}
