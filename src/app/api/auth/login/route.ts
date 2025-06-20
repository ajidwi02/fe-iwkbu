// src/app/api/auth/login/route.ts
import { query } from "@/lib/db";
import { sign } from "jsonwebtoken";
import { serialize } from "cookie";
import { compare } from "bcryptjs";
import { NextResponse } from "next/server";

const SECRET_KEY = process.env.JWT_SECRET || "default-secret";
const BCRYPT_SALT_ROUNDS = 10;

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const userResults: any = await query({
      query: "SELECT id, username, password FROM users WHERE username = ?",
      values: [username],
    });

    if (userResults.length === 0) {
      return NextResponse.json(
        { message: "Username atau password salah." },
        { status: 401 }
      );
    }

    const user = userResults[0];
    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { message: "Username atau password salah." },
        { status: 401 }
      );
    }

    const token = sign(
      {
        userId: user.id,
        username: user.username,
      },
      SECRET_KEY,
      { expiresIn: "1h" } // Token berlaku selama 1 jam
    );

    const serializedCookie = serialize("sessionToken", token, {
      httpOnly: true, // Mencegah akses dari JavaScript sisi klien
      secure: process.env.NODE_ENV === "production", // Hanya kirim via HTTPS di produksi
      sameSite: "strict",
      maxAge: 60 * 60, // 1 jam dalam detik
      path: "/",
    });

    return new Response(JSON.stringify({ message: "Login berhasil" }), {
      status: 200,
      headers: { "Set-Cookie": serializedCookie },
    });
  } catch (e: any) {
    return NextResponse.json({ message: e.message }, { status: 500 });
  }
}
