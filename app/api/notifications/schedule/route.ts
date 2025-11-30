import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("is_admin")?.value === "1";
  if (!isAdmin) {
    console.log("Unauthorized access attempt to schedule notification");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { title, message, scheduledAt } = body || {};
    if (!title || !message || !scheduledAt) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}`;
    const scheduledTime = new Date(scheduledAt).toISOString();
    return NextResponse.json(
      { id, title, message, scheduledAt: scheduledTime, status: "scheduled" },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
