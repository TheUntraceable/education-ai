"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { PlusCircle, BookOpen, GraduationCap } from "lucide-react"
import type { Tutor } from "@/lib/types"
import { useMobile } from "@/hooks/use-mobile"
import { useSearchParamsClient } from "@/hooks/use-search-params-client"

export function Sidebar() {
  const [tutors, setTutors] = useState<Tutor[]>([])
  const [loading, setLoading] = useState(true)
  const [chats, setChats] = useState<any[]>([])
  const [loadingChats, setLoadingChats] = useState(false)
  const router = useRouter()
  const { selectedTutor, selectedChat } = useSearchParamsClient()
  const isMobile = useMobile()

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const response = await fetch("/api/tutors")
        const data = await response.json()
        setTutors(data)
      } catch (error) {
        console.error("Error fetching tutors:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTutors()
  }, [])

  useEffect(() => {
    if (selectedTutor) {
      fetchChats(selectedTutor)
    }
  }, [selectedTutor])

  const fetchChats = async (tutorId: string) => {
    setLoadingChats(true)
    try {
      const response = await fetch(`/api/chats?tutorId=${tutorId}`)
      const data = await response.json()
      setChats(data)
    } catch (error) {
      console.error("Error fetching chats:", error)
    } finally {
      setLoadingChats(false)
    }
  }

  const selectTutor = (tutorId: string) => {
    router.push(`/app/?tutor=${tutorId}`)
  }

  const selectChat = (chatId: string) => {
    router.push(`/app/?tutor=${selectedTutor}&chat=${chatId}`)
  }

  const createNewChat = async () => {
    if (!selectedTutor) return

    try {
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tutorId: selectedTutor }),
      })

      const data = await response.json()
      router.push(`/?tutor=${selectedTutor}&chat=${data._id}`)

      // Refresh chat list
      fetchChats(selectedTutor)
    } catch (error) {
      console.error("Error creating new chat:", error)
    }
  }

  if (isMobile) {
    return null
  }

  return (
    <div className="w-80 border-r bg-background h-screen flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold flex items-center">
          <GraduationCap className="mr-2" />
          Education AI
        </h1>
      </div>

      <div className="p-4">
        <h2 className="text-sm font-semibold mb-2">Select a Tutor</h2>
        <div className="space-y-2">
          {loading
            ? Array(4)
                .fill(0)
                .map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
            : tutors.map((tutor) => (
                <Button
                  key={tutor._id}
                  variant={selectedTutor === tutor._id ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => selectTutor(tutor._id)}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  {tutor.name}
                </Button>
              ))}
        </div>
      </div>

      {selectedTutor && (
        <>
          <Separator />
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold">Your Chats</h2>
              <Button variant="ghost" size="icon" onClick={createNewChat} title="New Chat">
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="space-y-2 pr-4">
                {loadingChats ? (
                  Array(3)
                    .fill(0)
                    .map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
                ) : chats.length > 0 ? (
                  chats.map((chat) => (
                    <Button
                      key={chat._id}
                      variant={selectedChat === chat._id ? "default" : "outline"}
                      className="w-full justify-start text-left"
                      onClick={() => selectChat(chat._id)}
                    >
                      <span className="truncate">
                        {chat.title || `Chat ${new Date(chat.createdAt).toLocaleDateString()}`}
                      </span>
                    </Button>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No chats yet. Start a new conversation!
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>
        </>
      )}
    </div>
  )
}

