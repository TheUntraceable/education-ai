import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
    request: Request,
    { params }: { params: { id: string } },
) {
    try {
        const id = params.id;

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
    { params }: { params: { id: string } },
) {
    try {
        const id = params.id;
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
    { params }: { params: { id: string } },
) {
    try {
        const id = params.id;

        const client = await clientPromise;
        const db = client.db("education-ai");

        // Delete chat
        const result = await db
            .collection("chats")
            .deleteOne({ _id: new ObjectId(id) });

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
