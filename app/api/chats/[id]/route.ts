import clientPromise from "@/lib/mongodb";
import { authOptions } from "@/lib/utils/auth-options";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 },
        );
    }
    try {
        const { id } = await params;

        const client = await clientPromise;
        const db = client.db("education-ai");

        const chat = await db
            .collection("chats")
            .findOne({ _id: new ObjectId(id) });

        if (!chat) {
            return NextResponse.json(
                { error: "Chat not found" },
                { status: 404 },
            );
        }

        return NextResponse.json(chat);
    } catch (error) {
        console.error("Error fetching chat:", error);
        return NextResponse.json(
            { error: "Failed to fetch chat" },
            { status: 500 },
        );
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
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
        const { id } = await params;
        const { title } = await request.json();

        const client = await clientPromise;
        const db = client.db("education-ai");

        const result = await db
            .collection("chats")
            .updateOne(
                { _id: new ObjectId(id) },
                { $set: { title, updatedAt: new Date() } },
            );

        if (result.matchedCount === 0) {
            return NextResponse.json(
                { error: "Chat not found" },
                { status: 404 },
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating chat:", error);
        return NextResponse.json(
            { error: "Failed to update chat" },
            { status: 500 },
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
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
        const { id } = await params;

        const client = await clientPromise;
        const db = client.db("education-ai");

        // Delete chat
        const result = await db
            .collection("chats")
            .deleteOne({ _id: new ObjectId(id), owner: session.user?.email });

        if (result.deletedCount === 0) {
            return NextResponse.json(
                { error: "Chat not found" },
                { status: 404 },
            );
        }

        // Delete all messages in the chat
        await db.collection("messages").deleteMany({ chatId: id });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting chat:", error);
        return NextResponse.json(
            { error: "Failed to delete chat" },
            { status: 500 },
        );
    }
}
