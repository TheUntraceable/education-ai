"use client"

import { useSearchParams } from "next/navigation"

export function useSearchParamsClient() {
  const searchParams = useSearchParams()

  const selectedTutor = searchParams?.get("tutor") || ""
  const selectedChat = searchParams?.get("chat") || ""

  return {
    selectedTutor,
    selectedChat,
  }
}

