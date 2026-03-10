import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { sql } from "@/db";
import bcrypt from "bcrypt";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan password diperlukan");
        }

        // Cari user di database Neon
        const result = await sql`
          SELECT * FROM users WHERE email = ${credentials.email} LIMIT 1
        `;

        const user = result[0];

        // Verifikasi apakah user ada dan password (jika sudah ada kolom password) cocok
        // Catatan: Pastikan kolom password sudah ditambahkan ke tabel users di database
        if (!user || !user.password) {
          throw new Error("User tidak ditemukan atau password belum diatur");
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordCorrect) {
          throw new Error("Password salah");
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.nama,
          role: user.role, // Tambahkan role
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login", // Mengarah ke halaman login custom
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role; // Simpan role ke token
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role; // Simpan role ke session
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
