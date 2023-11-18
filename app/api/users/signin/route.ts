import { startDb } from "@/app/lib/db"
import { SignInCredentials } from "@/app/types"
import prisma from "@/prisma"
import bcrypt from "bcrypt";
import { NextResponse } from "next/server"

export const POST = async (req: Request) => {
    const {email, password} = await req.json() as SignInCredentials
    if (!email || !password) return NextResponse.json({error: "Invalid request, email/password missing!"})

    await startDb()

    const user = await prisma.user.findUnique({
        where: {
            email:email
        }
    })

    
    if (!user || !user?.password) return NextResponse.json({error: "Email/password missmatch!"})

    

    const isCorrectPassword = await bcrypt.compare(
        password,
        user.password
      );

      if(!isCorrectPassword) {
        console.log("TESTE ====>>", user)
        return NextResponse.json({error: "Email/password invalid!"});
      }

           

      return NextResponse.json({
        user: {
            id:user.id.toString(), 
            name: user.name, 
            email: user.email,
            emailVerified: user.emailVerified, 
            role: user.role}})    
    }
