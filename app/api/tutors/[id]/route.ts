import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const client = await clientPromise
    const db = client.db("education-ai")

    const tutor = await db.collection("tutors").findOne({ _id: new ObjectId(id) })

    if (!tutor) {
      return NextResponse.json({ error: "Tutor not found" }, { status: 404 })
    }

    return NextResponse.json(tutor)
  } catch (error) {
    console.error("Error fetching tutor:", error)
    return NextResponse.json({ error: "Failed to fetch tutor" }, { status: 500 })
  }
}

