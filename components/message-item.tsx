"use client"

import { useState, useEffect } from "react"
import type { ChatMessage } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Edit, RotateCcw, User, Bot } from "lucide-react"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"

interface MessageItemProps {
  message: ChatMessage
  onEdit: (messageId: string, content: string) => void
  onRerun: () => void
  isLastUserMessage: boolean
  isStreaming?: boolean
}

export function MessageItem({ message, onEdit, onRerun, isLastUserMessage, isStreaming = false }: MessageItemProps) {
  const [showActions, setShowActions] = useState(false)
  const [cursorVisible, setCursorVisible] = useState(true)

  // Blinking cursor effect for streaming messages
  useEffect(() => {
    if (!isStreaming) return

    const interval = setInterval(() => {
      setCursorVisible((prev) => !prev)
    }, 500)

    return () => clearInterval(interval)
  }, [isStreaming])

  const isUser = message.role === "user"

  return (
    <div
      className="group relative"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            isUser ? "bg-primary/10" : "bg-primary",
          )}
        >
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-primary-foreground" />}
        </div>

        <div className="flex-1">
          <div className="font-medium mb-1">{isUser ? "You" : "Tutor"}</div>

          <Card className={cn("p-4", isUser ? "bg-muted" : "bg-background")}>
            {isUser ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{message.content}</ReactMarkdown>
                {isStreaming && cursorVisible && <span className="animate-pulse">▋</span>}
              </div>
            )}
          </Card>

          <div className="text-xs text-muted-foreground mt-1">
            {isStreaming ? "Typing..." : new Date(message.createdAt).toLocaleTimeString()}
          </div>
        </div>
      </div>

      {isUser && !isStreaming && (showActions || isLastUserMessage) && (
        <div className="absolute -left-12 top-8 flex flex-col gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(message._id, message.content)}
            title="Edit message"
          >
            <Edit className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRerun} title="Rerun message">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

