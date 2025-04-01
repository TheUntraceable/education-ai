"use client";

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"
import { Toaster } from "sonner"

export default function Providers({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <SessionProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                {children}
                <Toaster />
            </ThemeProvider>
        </SessionProvider>
    )
}