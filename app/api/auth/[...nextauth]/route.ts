import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcrypt";
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import prisma from "@/prisma";
import { SessionUserProfile } from "@/app/types";


declare module "next-auth" {
  interface Session {
    user: SessionUserProfile
  }
}


export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),

   CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials?.email,
          },
        });       

        if (!user || !user?.password) {
          throw new Error("Invalid credentials");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if(!isCorrectPassword) {
          return null;
        }
        
        return user;
      },
    }),
  ],
  callbacks:{
    async jwt(params) {
      console.log("jwt ====>" , params)
      if (params.user){
        params.token = {...params.token, ...params.user}
        
      }
      return params.token
    },
   async session(params) {
    console.log("session ====>" , params)
    const user = params.token as typeof params.token & SessionUserProfile
    console.log(user.emailVerified)
 
    if(user){
       params.session.user = {...params.session.user, 
        id: user.id,
        name: user.name,
        email: user.email, 
        emailVerified: user.emailVerified, 
        role: user.role
      }    
    } 
    return params.session
    },
  },
  pages: {
    signIn: "/", //??
  },
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
