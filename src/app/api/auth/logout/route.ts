import { serialize } from "cookie";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // Hapus cookie dengan mengatur maxAge ke -1
  const serializedCookie = serialize("sessionToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: -1, // Langsung expired
    path: "/",
  });

  return new Response(JSON.stringify({ message: "Logout berhasil" }), {
    status: 200,
    headers: { "Set-Cookie": serializedCookie },
  });
}
