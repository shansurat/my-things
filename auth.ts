import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("Auth attempt for:", credentials?.username);
        if (!credentials?.username || !credentials?.password) return null;

        // Dynamic imports to prevent Edge Runtime errors in middleware
        const { connectMongoDB } = await import("@/lib/mongodb");
        const { default: User } = await import("@/models/User");
        const bcrypt = await import("bcryptjs");
        const bcryptCompare = bcrypt.default?.compare || bcrypt.compare;

        try {
          await connectMongoDB();
          console.log("PRODUCTION AUTH: Connected to MongoDB successfully");
          const user = await User.findOne({ username: credentials.username });

          if (!user || !user.password) {
            console.log("PRODUCTION AUTH: User not found or no password for:", credentials.username);
            return null;
          }

          const isValid = await bcryptCompare(
            credentials.password as string,
            user.password
          );

          if (!isValid) {
            console.log("PRODUCTION AUTH: Invalid password for:", credentials.username);
            return null;
          }

          console.log("PRODUCTION AUTH: Login successful for:", credentials.username);
          
          // Ensure ID is a clean string for Vercel/NextAuth serialization
          return {
            id: user._id.toString(),
            name: user.username,
            username: user.username,
          };
        } catch (error) {
          console.error("PRODUCTION AUTH: Connection/DB Error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        console.log("PRODUCTION AUTH: JWT created for user ID:", user.id);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).username = token.username;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage = nextUrl.pathname === "/login" || nextUrl.pathname === "/register";
      
      if (!isLoggedIn && !isAuthPage) {
        return false; // Redirect to login
      }
      if (isLoggedIn && isAuthPage) {
        return Response.redirect(new URL("/", nextUrl));
      }
      return true;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
