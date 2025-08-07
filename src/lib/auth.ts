import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Deklaracje typów
declare module "next-auth" {
  interface User {
    id: string;
    name: string | null;
    email: string;
    role?: string;
  }
  
  interface Session {
    user?: {
      id: string;
      role?: string;
      name?: string | null;
      email?: string;
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    email?: string;
    name?: string | undefined;  // Zmienione z string na string | undefined
  }
}

export const authOptions: NextAuthOptions = {
  debug: true,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Hasło", type: "password" }
      },
      async authorize(credentials) {
        console.log("Próba autoryzacji dla:", credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          console.log("Brak poprawnych danych uwierzytelniających");
          return null;
        }

        try {
          // Pobieranie użytkownika z bazy danych
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          if (!user) {
            console.log("Użytkownik nie znaleziony w bazie danych");
            return null;
          }

          // Sprawdzenie hasła (jako plaintext)
          if (user.password === credentials.password) {
            console.log("Autoryzacja pomyślna dla:", user.email, "ID z bazy:", user.id);
            
            // Konwertujemy użytkownika z bazy danych na format wymagany przez NextAuth
            const authUser = {
              id: user.id,    // <-- PRAWDZIWE ID Z BAZY DANYCH
              name: user.name,
              email: user.email,
              role: user.role,
            };
            
            console.log("Zwracam authUser:", authUser);
            return authUser;
          } else {
            console.log("Niepoprawne hasło");
            return null;
          }
        } catch (error) {
          console.error("Błąd podczas autoryzacji:", error);
          return null;
        } finally {
          // Zalecane zamykanie połączenia Prisma w kontekście serverless
          await prisma.$disconnect();
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Przy pierwszym logowaniu (gdy user istnieje)
      if (user) {
        console.log('JWT callback - user from authorize:', user);
        
        // UPEWNIJ SIĘ, że używamy prawdziwego ID z bazy danych
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email }
          });
          
          if (dbUser) {
            console.log('JWT callback - user from DB:', dbUser);
            token.id = dbUser.id;  // <-- Używamy ID z bazy danych!
            token.role = dbUser.role;
            token.email = dbUser.email;
            token.name = dbUser.name || undefined;
          } else {
            console.error('JWT callback - user not found in DB for email:', user.email);
            // Nie zwracamy null - NextAuth nie lubi tego w jwt callback
            // Zamiast tego zwracamy token bez ID
          }
        } catch (error) {
          console.error('JWT callback - DB error:', error);
          // Analogicznie - nie zwracamy null
        } finally {
          await prisma.$disconnect();
        }
      }
      
      console.log('JWT callback - final token:', { id: token.id, email: token.email });
      return token;
    },
    
    async session({ session, token }) {
      console.log('Session callback - token:', { id: token.id, email: token.email });
      
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) || 'user';
        session.user.email = (token.email as string) || session.user.email || '';
        session.user.name = token.name || session.user.name || null;
      }
      
      console.log('Session callback - final session:', session.user);
      return session;
    },
    
    async redirect({ url, baseUrl }) {
      console.log("NextAuth redirect callback:", { url, baseUrl });
      
      if (url.startsWith('/login') && url.includes('callbackUrl=/login')) {
        return baseUrl;
      }
      
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      } else if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dni
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "temporary-secret-for-development",
};