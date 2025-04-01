import { NextResponse } from "next/server";
import { StreamingTextResponse, OpenAIStream } from "ai";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { OpenAI } from "openai";

// Initialize Nebius AI (OpenAI compatible)
const ai = new OpenAI({
    baseURL: "https://api.studio.nebius.com/v1/",
    apiKey: process.env.NEBIUS_API_KEY,
});

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const chatId = searchParams.get("chatId");

        if (!chatId) {
            return NextResponse.json(
                { error: "chatId is required" },
                { status: 400 },
            );
        }

        const client = await clientPromise;
        const db = client.db("education-ai");

        const messages = await db
            .collection("messages")
            .find({ chatId })
            .sort({ createdAt: 1 })
            .toArray();

        return NextResponse.json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        return NextResponse.json(
            { error: "Failed to fetch messages" },
            { status: 500 },
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { chatId, content, tutorId, rerun = false } = body;

        console.log("Message request received:", {
            chatId,
            tutorId,
            contentLength: content?.length,
            rerun,
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
            role: msg.role === "user" ? "user" : "assistant",
            content: msg.content,
        }));

        // Add system message with tutor info
        const systemMessage = {
            role: "system",
            content: `You are ${tutor.name}, a tutor specializing in ${tutor.subject}. ${tutor.description} Be helpful, encouraging, and educational in your responses. Explain concepts clearly and provide examples when appropriate. Keep your responses concise and focused on the student's questions.`,
        };

        console.log("Sending request to AI...");

        try {
            // Generate AI response with streaming
            const response = await ai.chat.completions.create({
                model: "deepseek-ai/DeepSeek-V3-0324", // Use the appropriate model supported by Nebius
                messages: [systemMessage, ...messageHistory],
                temperature: 0.7,
                max_tokens: 1500,
                stream: true, // Enable streaming
            });

            // Create a stream from the OpenAI response
            const stream =
                (response,
                {
                    async onCompletion(completion) {
                        // Save the complete message to the database once streaming is done
                        const assistantMessage = {
                            chatId,
                            content: completion,
                            role: "assistant",
                            createdAt: new Date(),
                        };

                        const result = await db
                            .collection("messages")
                            .insertOne(assistantMessage);
                        console.log(
                            "Saved assistant message with ID:",
                            result.insertedId,
                        );

                        // If this is the first message, update chat title
                        if (previousMessages.length <= 1) {
                            try {
                                // Generate a title based on the first user message
                                const titleCompletion =
                                    await ai.chat.completions.create({
                                        model: "deepseek-ai/DeepSeek-V3-0324",
                                        messages: [
                                            {
                                                role: "system",
                                                content:
                                                    "Generate a short, concise title (maximum 6 words) for a chat that starts with this message. Return only the title text with no quotes or additional text.",
                                            },
                                            { role: "user", content },
                                        ],
                                        temperature: 0.7,
                                        max_tokens: 20,
                                    });

                                const title =
                                    titleCompletion.choices[0].message.content.trim();

                                await db
                                    .collection("chats")
                                    .updateOne(
                                        { _id: new ObjectId(chatId) },
                                        { $set: { title } },
                                    );

                                console.log("Updated chat title to:", title);
                            } catch (titleError) {
                                console.error(
                                    "Error generating title:",
                                    titleError,
                                );
                                // Continue even if title generation fails
                            }
                        }
                    },
                });

            // Return the streaming response
            return new StreamingTextResponse(stream);
        } catch (aiError) {
            console.error("AI Error:", aiError);

            // Save a fallback message if AI fails
            const fallbackMessage = {
                chatId,
                content:
                    "I'm sorry, I encountered an error processing your request. Please try again later.",
                role: "assistant",
                createdAt: new Date(),
            };

            const fallbackResult = await db
                .collection("messages")
                .insertOne(fallbackMessage);

            return NextResponse.json({
                ...fallbackMessage,
                _id: fallbackResult.insertedId.toString(),
                error: aiError.message,
            });
        }
    } catch (error) {
        console.error("Error creating message:", error);
        return NextResponse.json(
            { error: "Failed to create message", details: error.message },
            { status: 500 },
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const chatId = searchParams.get("chatId");

        if (!chatId) {
            return NextResponse.json(
                { error: "chatId is required" },
                { status: 400 },
            );
        }

        const client = await clientPromise;
        const db = client.db("education-ai");

        await db.collection("messages").deleteMany({ chatId });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting messages:", error);
        return NextResponse.json(
            { error: "Failed to delete messages" },
            { status: 500 },
        );
    }
}
