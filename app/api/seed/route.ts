import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// This is a utility endpoint to seed the database with initial data
// You would typically remove this in production
export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("education-ai")

    // Check if tutors collection already has data
    const tutorsCount = await db.collection("tutors").countDocuments()

    if (tutorsCount === 0) {
      // Seed tutors
      await db.collection("tutors").insertMany([
        {
          _id: new ObjectId(),
          name: "Professor Einstein",
          subject: "Physics",
          description:
            "Expert in theoretical physics with a focus on relativity and quantum mechanics. I can help explain complex physics concepts in simple terms.",
        },
        {
          _id: new ObjectId(),
          name: "Ms. Ada",
          subject: "Computer Science",
          description:
            "Specialized in programming, algorithms, and computer science fundamentals. I can help with coding problems and explain CS concepts clearly.",
        },
        {
          _id: new ObjectId(),
          name: "Dr. Newton",
          subject: "Mathematics",
          description:
            "Mathematics expert with knowledge in calculus, algebra, and statistics. I can help solve math problems step-by-step and explain mathematical concepts.",
        },
        {
          _id: new ObjectId(),
          name: "Professor Curie",
          subject: "Chemistry",
          description:
            "Chemistry specialist with expertise in organic chemistry, biochemistry, and chemical reactions. I can help with chemical equations and concepts.",
        },
        {
          _id: new ObjectId(),
          name: "Mr. Shakespeare",
          subject: "Literature",
          description:
            "Literature expert with knowledge of classic and modern works. I can help with literary analysis, writing essays, and understanding complex texts.",
        },
      ])

      return NextResponse.json({ success: true, message: "Database seeded successfully" })
    }

    return NextResponse.json({ success: true, message: "Database already seeded" })
  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json({ error: "Failed to seed database", details: error.message }, { status: 500 })
  }
}

