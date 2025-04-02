import { Suspense } from "react";
import { Sidebar } from "@/components/sidebar";
import { ChatContainer } from "@/components/chat-container";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthCheck } from "@/components/auth/auth-check";

export default function App() {
    return (
        <AuthCheck>
            <div className="flex h-screen overflow-hidden">
                <Suspense fallback={<SidebarSkeleton />}>
                    <Sidebar />
                </Suspense>
                <Suspense fallback={<ChatSkeleton />}>
                    <ChatContainer />
                </Suspense>
            </div>
        </AuthCheck>
    );
}

function SidebarSkeleton() {
    return (
        <div className="w-80 border-r bg-background h-screen flex flex-col">
            <div className="p-4 border-b">
                <Skeleton className="h-8 w-40" />
            </div>
            <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        </div>
    );
}

function ChatSkeleton() {
    return (
        <div className="flex-1 flex flex-col h-screen">
            <div className="border-b p-4">
                <Skeleton className="h-8 w-40" />
            </div>
            <div className="flex-1 p-4">
                <div className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            </div>
        </div>
    );
}
