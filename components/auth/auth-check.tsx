"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export function AuthCheck({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();

    console.log(session, status);

    if (status === "loading") {
        return <>Loading...</>;
    }

    if (status === "authenticated") {
        return <>{children}</>;
    } else {
        return (
            <>
                <div className="flex items-center justify-center h-screen">
                    <div className="bg-zinc-800 text-white p-8 rounded-lg">
                        <h2 className="text-2xl font-bold mb-4">
                            Not signed in
                        </h2>
                        <p className="mb-4">
                            Please sign in first to see this content.
                        </p>
                        <Link
                            href="/api/auth/signin"
                            className="inline-block bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-md transition-colors"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            </>
        );
    }
}
