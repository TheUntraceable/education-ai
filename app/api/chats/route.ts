import clientPromise from "@/lib/mongodb";
import { authOptions } from "@/lib/utils/auth-options";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const tutorId = searchParams.get("tutorId");

        if (!tutorId) {
            return NextResponse.json(
                { error: "tutorId is required" },
                { status: 400 },
            );
        }

        const client = await clientPromise;
        const db = client.db("education-ai");

        const chats = await db
            .collection("chats")
            .find({ tutorId: tutorId })
            .sort({ updatedAt: -1 })
            .toArray();

        return NextResponse.json(chats);
    } catch (error) {
        console.error("Error fetching chats:", error);
        return NextResponse.json(
            { error: "Failed to fetch chats" },
            { status: 500 },
        );
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 },
        );
    }
    if (!session.user.email) {
        return NextResponse.json(
            { error: "User email is required" },
            { status: 400 },
        );
    }

    try {
        const { tutorId } = await request.json();

        if (!tutorId) {
            return NextResponse.json(
                { error: "tutorId is required" },
                { status: 400 },
            );
        }

        const client = await clientPromise;
        const db = client.db("education-ai");

        const now = new Date();

        const result = await db.collection("chats").insertOne({
            tutorId,
            createdAt: now,
            updatedAt: now,
            owner: session.user!.email,
        });

        const chat = await db
            .collection("chats")
            .findOne({ _id: result.insertedId });

        return NextResponse.json(chat);
    } catch (error) {
        console.error("Error creating chat:", error);
        return NextResponse.json(
            { error: "Failed to create chat" },
            { status: 500 },
        );
    }
}
