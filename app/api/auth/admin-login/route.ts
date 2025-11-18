import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ status: false, message: "Email and password are required" }, { status: 400 });
    }

    const ADMIN_EMAIL = "admin@glimz.com";
    const ADMIN_PASSWORD = "glimz_admin_123";

    const isValid = email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD;
    if (!isValid) {
      return NextResponse.json({ status: false, message: "Invalid credentials" }, { status: 401 });
    }

    const res = NextResponse.json({ status: true });
    const isProd = process.env.NODE_ENV === "production";

    res.cookies.set("is_admin", "1", {
      httpOnly: false,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 hours
    });

    return res;
  } catch (e) {
    return NextResponse.json({ status: false, message: "Invalid request" }, { status: 400 });
  }
}
