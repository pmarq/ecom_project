import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/prisma";
import { SessionUserProfile, SignInCredentials } from "@/app/types";


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
      type: "credentials",
      credentials: {},
      async authorize(credentials, request) {
        const {email , password} = credentials as SignInCredentials
        //send  request to your api route where you can sign in your user and send error or success response to this function.
        
        const {user , error} = await fetch( "http://localhost:3000/api/users/signin", {
          method:"POST",
          body: JSON.stringify({email, password})
        }).then(async res => await res.json());

        if(error) return null;

        return {id: user.id, ...user}             
      },
      
    }),
  ],
  
  callbacks:{
    async jwt(params) {
      console.log("jwt ====>" , params)
      if(params.user){
        params.token.user = {...params.token,...params.user}
        
      }      
     
      return params.token
    },

   async session(params:any) {

    const user = params.token.user
    if(user){

      const userDataFromDatabase = await prisma.user.findUnique({
        where: { id: user.id },
        select: { emailVerified: true }
      });

      if (userDataFromDatabase) {
        // Update the emailVerified status from the database
        user.emailVerified = userDataFromDatabase.emailVerified;      }


     params.session.user = {...params.session.user, ...user}
    }
    
    console.log("session ====>" , params)

   // const user = params.token as typeof params.token & SessionUserProfile      
    
    console.log("newparamstokenUSER====>", user)

    //console.log("Email verified? =====>", user.emailVerified) //verified com letra minuscula
    //console.log("Role? =====>",user.role)    
   
    return params.session;
    },
  },   
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
