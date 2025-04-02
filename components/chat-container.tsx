"use client";

import { EmptyState } from "@/components/empty-state";
import { MessageItem } from "@/components/message-item";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useMobile } from "@/hooks/use-mobile";
import { useSearchParamsClient } from "@/hooks/use-search-params-client";
import { useToast } from "@/hooks/use-toast";
import type { ChatMessage, Tutor } from "@/lib/types";
import {
    ArrowUp,
    Bold,
    ChevronDown,
    Code,
    GraduationCap,
    Info,
    Italic,
    List,
    Loader2,
    Menu,
    MessageSquare,
    PlusCircle,
    Send,
    Trash2
} from "lucide-react";
import type React from "react";
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
    const [autoScroll, setAutoScroll] = useState(true);
    const [showScrollToBottom, setShowScrollToBottom] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const [characterCount, setCharacterCount] = useState(0);
    const MAX_CHAR_COUNT = 4000;

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

    // useEffect(() => {
    //     if (autoScroll) {
    //         scrollToBottom();
    //     }
    // }, [messages.length, autoScroll]);

    // useEffect(() => {
    //     if (autoScroll && streamingContent) {
    //         scrollToBottom();
    //     }
    // }, [streamingContent, autoScroll]);

    // useEffect(() => {
    //     const scrollArea = scrollAreaRef.current;

    //     const handleScroll = () => {
    //         if (!scrollArea) return;

    //         const { scrollTop, scrollHeight, clientHeight } = scrollArea;
    //         const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;

    //         setAutoScroll(isAtBottom);
    //         setShowScrollToBottom(!isAtBottom);
    //     };

    //     scrollArea?.addEventListener("scroll", handleScroll);
    //     return () => scrollArea?.removeEventListener("scroll", handleScroll);
    // }, []);

    useEffect(() => {
        setCharacterCount(input.length);
    }, [input]);

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

    // const scrollToBottom = () => {
    //     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    // };

    // const handleScrollToBottom = () => {
    //     scrollToBottom();
    //     setAutoScroll(true);
    //     setShowScrollToBottom(false);
    // };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();

        if (!input.trim() || !selectedTutor || !selectedChat) return;
        if (characterCount > MAX_CHAR_COUNT) {
            toast({
                title: "Message too long",
                description: `Your message exceeds the ${MAX_CHAR_COUNT} character limit.`,
                variant: "destructive",
            });
            return;
        }

        const messageContent = input;
        setInput("");
        setHistoryIndex(-1);
        setEditingMessage(null);
        setStreamingContent("");

        setMessageHistory((prev) => [messageContent, ...prev.slice(0, 49)]);

        const tempId = `temp-${Date.now()}`;
        const userMessage: ChatMessage = {
            _id: tempId,
            chatId: selectedChat,
            content: messageContent,
            role: "user",
            createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setAutoScroll(true);

        setLoading(true);
        try {
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

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) {
                throw new Error("Failed to get response reader");
            }

            const streamingId = `streaming-${Date.now()}`;
            const streamingMessage: ChatMessage = {
                _id: streamingId,
                chatId: selectedChat,
                content: "",
                role: "assistant",
                createdAt: new Date().toISOString(),
                thinking: "",
            };

            setMessages((prev) => [...prev, streamingMessage]);
            // scrollToBottom();

            let accumulatedContent = "";
            let accumulatedThinking = "";
            let inThinkingBlock = false;

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    break;
                }

                const chunk = decoder.decode(value, { stream: true });
                
                // Process chunk to extract thinking blocks
                let processedChunk = "";
                for (let i = 0; i < chunk.length; i++) {
                    // Check for opening thinking tag
                    if (chunk.substring(i).startsWith("<think>") && !inThinkingBlock) {
                        inThinkingBlock = true;
                        i += 6; // Skip "<think>"
                        continue;
                    }
                    
                    // Check for closing thinking tag
                    if (chunk.substring(i).startsWith("</think>") && inThinkingBlock) {
                        inThinkingBlock = false;
                        i += 7; // Skip "</think>"
                        continue;
                    }
                    
                    // Add character to the appropriate accumulated content
                    if (inThinkingBlock) {
                        accumulatedThinking += chunk[i];
                    } else {
                        processedChunk += chunk[i];
                    }
                }
                
                // Update accumulatedContent with non-thinking text
                accumulatedContent += processedChunk;

                setMessages((prev) =>
                    prev.map((msg) =>
                        msg._id === streamingId
                            ? { 
                                ...msg, 
                                content: accumulatedContent,
                                thinking: accumulatedThinking 
                            }
                            : msg,
                    ),
                );

                if (autoScroll) {
                    // scrollToBottom();
                }
            }
            setStreamingContent(accumulatedContent);

            setTimeout(() => {
                fetchMessages({ chatId: selectedChat, showRefetching: false });
            }, 100);
        } catch (error) {
            console.error("Error sending message:", error);
            toast({
                title: "Error sending message",
                description:
                    (error as Error).message ||
                    "Failed to send message. Please try again.",
                variant: "destructive",
            });

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

        const messagesToKeep = messages.slice(0, messageIndex);
        const messageToRerun = messages[messageIndex];

        if (messageToRerun.role !== "user") return;

        setMessages(messagesToKeep);
        setStreamingContent("");
        setAutoScroll(true);

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

            setMessages((prev) => [...prev, messageToRerun]);
            // scrollToBottom();

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) {
                throw new Error("Failed to get response reader");
            }

            const streamingId = `streaming-${Date.now()}`;
            const streamingMessage: ChatMessage = {
                _id: streamingId,
                chatId: selectedChat,
                content: "",
                role: "assistant",
                createdAt: new Date().toISOString(),
                thinking: "",
            };

            setMessages((prev) => [...prev, streamingMessage]);

            let accumulatedContent = "";
            let accumulatedThinking = "";
            let inThinkingBlock = false;

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    break;
                }

                const chunk = decoder.decode(value, { stream: true });
                
                // Process chunk to extract thinking blocks
                let processedChunk = "";
                for (let i = 0; i < chunk.length; i++) {
                    // Check for opening thinking tag
                    if (chunk.substring(i).startsWith("<think>") && !inThinkingBlock) {
                        inThinkingBlock = true;
                        i += 6; // Skip "<think>"
                        continue;
                    }
                    
                    // Check for closing thinking tag
                    if (chunk.substring(i).startsWith("</think>") && inThinkingBlock) {
                        inThinkingBlock = false;
                        i += 7; // Skip "</think>"
                        continue;
                    }
                    
                    // Add character to the appropriate accumulated content
                    if (inThinkingBlock) {
                        accumulatedThinking += chunk[i];
                    } else {
                        processedChunk += chunk[i];
                    }
                }
                
                // Update accumulatedContent with non-thinking text
                accumulatedContent += processedChunk;

                setMessages((prev) =>
                    prev.map((msg) =>
                        msg._id === streamingId
                            ? { 
                                ...msg, 
                                content: accumulatedContent,
                                thinking: accumulatedThinking 
                            }
                            : msg,
                    ),
                );

                if (autoScroll) {
                    // scrollToBottom();
                }
            }

            setTimeout(() => {
                fetchMessages({ chatId: selectedChat, showRefetching: false });
            }, 100);
        } catch (error) {
            console.error("Error rerunning message:", error);
            toast({
                title: "Error",
                description: "Failed to rerun message. Please try again.",
                variant: "destructive",
            });

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
                `/api/chats/${selectedChat}`,
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

    const insertMarkdownFormat = (format: string) => {
        if (!inputRef.current) return;

        const textarea = inputRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;

        let newText = text;
        let newCursorPos = end;

        switch (format) {
            case "bold":
                newText =
                    text.substring(0, start) +
                    `**${text.substring(start, end)}**` +
                    text.substring(end);
                newCursorPos = end + 4;
                break;
            case "italic":
                newText =
                    text.substring(0, start) +
                    `*${text.substring(start, end)}*` +
                    text.substring(end);
                newCursorPos = end + 2;
                break;
            case "code":
                newText =
                    text.substring(0, start) +
                    "`" +
                    text.substring(start, end) +
                    "`" +
                    text.substring(end);
                newCursorPos = end + 2;
                break;
            case "codeblock":
                newText =
                    text.substring(0, start) +
                    "\n```\n" +
                    text.substring(start, end) +
                    "\n```\n" +
                    text.substring(end);
                newCursorPos = end + 8;
                break;
            case "list":
                const selectedText = text.substring(start, end);
                if (selectedText.includes("\n")) {
                    const formattedList = selectedText
                        .split("\n")
                        .map((line) => (line.trim() ? `- ${line}` : line))
                        .join("\n");
                    newText =
                        text.substring(0, start) +
                        formattedList +
                        text.substring(end);
                } else {
                    newText =
                        text.substring(0, start) +
                        `- ${selectedText}` +
                        text.substring(end);
                }
                newCursorPos = start + newText.substring(start).length;
                break;
        }

        setInput(newText);

        setTimeout(() => {
            textarea.focus();
            textarea.selectionStart = newCursorPos;
            textarea.selectionEnd = newCursorPos;
        }, 0);
    };

    return (
        <div className="flex-1 flex flex-col h-screen max-h-screen bg-muted/10">
            <header className="border-b p-4 flex items-center justify-between backdrop-blur-sm bg-background/90 sticky top-0 z-10">
                {isMobile && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSidebarOpen(true)}
                        className="mr-2"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                )}

                <div className="flex-1 flex items-center">
                    {tutor ? (
                        <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3 shadow-sm">
                                <GraduationCap className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="font-semibold">{tutor.name}</h2>
                                <div className="flex items-center">
                                    <Badge
                                        variant="outline"
                                        className="text-xs font-normal px-2 py-0"
                                    >
                                        {tutor.subject}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    ) : selectedTutor ? (
                        <div className="flex items-center">
                            <Skeleton className="w-10 h-10 rounded-full mr-3" />
                            <div>
                                <Skeleton className="h-5 w-40 mb-1" />
                                <Skeleton className="h-4 w-20" />
                            </div>
                        </div>
                    ) : (
                        <h2 className="font-medium">Select a tutor to start</h2>
                    )}
                </div>

                <div className="flex items-center space-x-1">
                    {selectedChat && messages.length > 0 && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={clearChat}
                                        className="text-muted-foreground hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Clear conversation</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                    )}
                </div>
            </header>

            <div className="relative flex-1 overflow-hidden">
                <ScrollArea className="h-full px-4 py-6" ref={scrollAreaRef}>
                    {loadingMessages ? (
                        <div className="space-y-6 max-w-3xl mx-auto">
                            {Array(3)
                                .fill(0)
                                .map((_, i) => (
                                    <Card
                                        key={i}
                                        className="p-4 flex flex-col gap-2"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Skeleton className="h-8 w-8 rounded-full" />
                                            <Skeleton className="h-4 w-24" />
                                        </div>
                                        <Skeleton className="h-24 w-full mt-2" />
                                    </Card>
                                ))}
                        </div>
                    ) : selectedChat && messages.length > 0 ? (
                        <div className="space-y-6 max-w-3xl mx-auto">
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
                                    <div className="flex items-center justify-center py-6">
                                        <div className="flex items-center space-x-2 text-primary text-sm">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>Thinking...</span>
                                        </div>
                                    </div>
                                )}
                            <div ref={messagesEndRef} className="h-1" />
                        </div>
                    ) : selectedChat ? (
                        <div className="h-full flex items-center justify-center">
                            <EmptyState
                                title="Start a conversation"
                                description="Send a message to begin chatting with your tutor."
                                icon={<MessageSquare className="h-12 w-12" />}
                            />
                        </div>
                    ) : selectedTutor ? (
                        <div className="h-full flex items-center justify-center">
                            <EmptyState
                                title="Create a new chat"
                                description="Start a new conversation with this tutor."
                                icon={<PlusCircle className="h-12 w-12" />}
                            />
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center">
                            <EmptyState
                                title="Welcome to Education AI"
                                description="Select a tutor from the sidebar to get started."
                                icon={<GraduationCap className="h-12 w-12" />}
                            />
                        </div>
                    )}
                </ScrollArea>

                {/* {showScrollToBottom && (
                    <Button
                        className="absolute bottom-4 right-4 rounded-full shadow-md"
                        size="icon"
                        onClick={handleScrollToBottom}
                    >
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                )} */}
            </div>

            {selectedChat && (
                <div className="border-t bg-background p-4">
                    <div className="max-w-3xl mx-auto">
                        <form
                            onSubmit={handleSubmit}
                            className="flex flex-col gap-2"
                        >
                            <div className="flex items-center gap-1 px-1 mb-1">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={() => insertMarkdownFormat('bold')}
                                            >
                                                <Bold className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Bold</TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={() => insertMarkdownFormat('italic')}
                                            >
                                                <Italic className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Italic</TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={() => insertMarkdownFormat('code')}
                                            >
                                                <Code className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Inline code</TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={() => insertMarkdownFormat('codeblock')}
                                            >
                                                <Code className="h-4 w-4 rotate-90" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Code block</TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={() => insertMarkdownFormat('list')}
                                            >
                                                <List className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Bullet list</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                            </div>

                            <div className="relative">
                                <Textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type your message here... Markdown is supported"
                                    className={`min-h-24 pr-12 resize-none transition-all focus:shadow-md ${characterCount > MAX_CHAR_COUNT
                                        ? "border-destructive"
                                        : ""
                                        }`}
                                    disabled={loading}
                                />
                                <div className="absolute bottom-3 right-3">
                                    <Button
                                        type="submit"
                                        size="icon"
                                        className={`rounded-full h-9 w-9 ${!input.trim() || loading
                                            ? "opacity-50"
                                            : "shadow-sm"
                                            }`}
                                        disabled={!input.trim() || loading}
                                    >
                                        {editingMessage ? (
                                            <ArrowUp className="h-4 w-4" />
                                        ) : loading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Send className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-xs text-muted-foreground px-1">
                                <div className="flex items-center gap-1.5">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                >
                                                    <Info className="h-3.5 w-3.5" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <div className="space-y-1 max-w-xs">
                                                    <p>Markdown supported:</p>
                                                    <ul className="list-disc pl-4 text-xs">
                                                        <li><code>**bold**</code> for <strong>bold</strong></li>
                                                        <li><code>*italic*</code> for <em>italic</em></li>
                                                        <li><code>`code`</code> for inline code</li>
                                                        <li><code>```</code> for code blocks</li>
                                                        <li><code>- list</code> for bullet lists</li>
                                                    </ul>
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>

                                    <span>
                                        Enter to send • Shift+Enter for new line
                                        • ↑ to edit last message
                                    </span>
                                </div>
                                <div
                                    className={`${characterCount > MAX_CHAR_COUNT
                                        ? "text-destructive font-medium"
                                        : ""
                                        }`}
                                >
                                    {characterCount}/{MAX_CHAR_COUNT}
                                </div>
                            </div>
                        </form>
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
