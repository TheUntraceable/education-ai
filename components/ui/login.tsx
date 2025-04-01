"use client";
import React, { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";

export function LoginHandler() {
    const { data: session, status } = useSession();
    const [buttonText, setButtonText] = useState("Sign in");

    useEffect(() => {
        if (status === "authenticated") {
            setButtonText("Sign Out");
        } else {
            setButtonText("Sign in");
        }
    }, [status]);

    if (status === "loading") {
        return <>...</>;
    }

    return (
        <button
            onClick={() => (status === "authenticated" ? signOut() : signIn())}
            className="flex space-x-2"
        >
            {status === "authenticated" && (
                <Image
                    src={
                        session.user?.image ??
                        "https://img.freepik.com/free-vector/user-circles-set_78370-4704.jpg?t=st=1720715554~exp=1720719154~hmac=e21e72790428e8eca6dfeae2586314053ce9ad293126392f4d14d291a476c503&w=32&h=32"
                    }
                    width={32}
                    height={32}
                    alt="User"
                />
            )}
            <span>{buttonText}</span>
        </button>
    );
}
