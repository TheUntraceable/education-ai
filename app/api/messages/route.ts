import clientPromise from "@/lib/mongodb";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

const ai = createOpenAI({
    baseURL: "https://api.studio.nebius.com/v1/",
    apiKey: process.env.NEBIUS_API_KEY,
    compatibility: "compatible",
});

export async function POST(request: Request) {
    const session = await getServerSession();
    if (!session || !session.user?.email) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 },
        );
    }

    try {
        const body = await request.json();
        const { chatId, content, tutorId, rerun = false } = body;

        console.log("Message request received:", {
            chatId,
            tutorId,
            contentLength: content?.length,
            rerun,
            userEmail: session.user.email,
        });

        if (!chatId || !content || !tutorId) {
            return NextResponse.json(
                { error: "chatId, content, and tutorId are required" },
                { status: 400 },
            );
        }

        const client = await clientPromise;
        const db = client.db("education-ai");

        // Get tutor info
        const tutor = await db
            .collection("tutors")
            .findOne({ _id: new ObjectId(tutorId) });

        if (!tutor) {
            return NextResponse.json(
                { error: "Tutor not found" },
                { status: 404 },
            );
        }

        console.log("Found tutor:", tutor.name);

        const now = new Date();

        // Save user message if not rerunning
        let userMessageId;
        if (!rerun) {
            const userMessageResult = await db
                .collection("messages")
                .insertOne({
                    chatId,
                    content,
                    role: "user",
                    createdAt: now,
                    owner: session.user.email,
                });
            userMessageId = userMessageResult.insertedId;
            console.log("Saved user message with ID:", userMessageId);
        }

        // Update chat's updatedAt
        await db
            .collection("chats")
            .updateOne(
                { _id: new ObjectId(chatId) },
                { $set: { updatedAt: now } },
            );

        // Get previous messages for context
        const previousMessages = await db
            .collection("messages")
            .find({ chatId })
            .sort({ createdAt: 1 })
            .toArray();

        console.log("Retrieved previous messages:", previousMessages.length);

        // Format messages for AI
        const messageHistory = previousMessages.map((msg) => ({
            role:
                msg.role === "user"
                    ? ("user" as const)
                    : ("assistant" as const),
            content: msg.content,
        }));

        // Add system message with tutor info
        const systemMessage = {
            role: "system" as const,
            content: `You are ${tutor.name}, a tutor specializing in ${tutor.subject}. ${tutor.description} Be helpful, encouraging, and educational in your responses. Explain concepts clearly and provide examples when appropriate. Keep your responses concise and focused on the student's questions.`,
        };

        console.log("Sending request to AI...");

        try {
            // Generate AI response with streaming
            const stream = streamText({
                model: ai("deepseek-ai/DeepSeek-R1-Distill-Llama-70B"),
                messages: [...messageHistory, systemMessage],
            });

            stream.text.then((text) => {
                console.log("AI response:", text);
                // Save AI response to the database
                const assistantMessage = {
                    chatId,
                    content: text,
                    role: "assistant",
                    createdAt: new Date(),
                    owner: session.user!.email,
                };
                db.collection("messages")
                    .insertOne(assistantMessage)
                    .then((result) => {
                        console.log(
                            "Saved assistant message with ID:",
                            result.insertedId,
                        );
                    });
            });
            return stream.toTextStreamResponse();
        } catch (aiError) {
            console.error("AI Error:", aiError);

            const fallbackMessage = {
                chatId,
                content:
                    "I'm sorry, I encountered an error processing your request. Please try again later.",
                role: "assistant",
                createdAt: new Date(),
                owner: session.user.email,
            };

            const fallbackResult = await db
                .collection("messages")
                .insertOne(fallbackMessage);

            return NextResponse.json({
                ...fallbackMessage,
                _id: fallbackResult.insertedId.toString(),
                error: aiError,
            });
        }
    } catch (error) {
        console.error("Error creating message:", error);
        return NextResponse.json(
            { error: "Failed to create message", details: error },
            { status: 500 },
        );
    }
}
