import { startDb } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { NewUserRequest } from "@/app/types";
import prisma from "@/prisma";
import bcrypt  from "bcrypt";
import nodemailer from "nodemailer"; 
import { createActivateToken } from "@/app/services/emailVerificationToken";




export const POST = async (req: Request) => {
    try{
    const body = await req.json() as NewUserRequest;  
    await startDb()
    const hashedPassword = await bcrypt.hash(body.password, 10)

    const token = createActivateToken()    

    const newUser = await prisma.user.create({data: {...body, password: hashedPassword } 
    });
    
    
   await prisma.activateToken.create({
    data: {
      token:token,
      userId: newUser.id
    }

   })

  const transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "826a5d3492a12f",
    pass: "fcdb64df814226"
  }
});
      
      
      
    const verificationLink = `http://localhost:3000/verifyPage?token=${token}&userId=${newUser.id}`;
    await transport.sendMail({
      from: "verification@nextecon.com",
      to: newUser.email as string,
      subject: "Verify Your Email",
      html: `<h1>Please verify your e-mail by clicking on <a href="${verificationLink}">This link</a></h1>`
    });
    
    return NextResponse.json({message: "Please check your email!"})

    } catch(error) {
        console.log(error);

        return NextResponse.json({ message: "Server error!"}, { status: 500 })

    } finally {
        await prisma.$disconnect();
    }
    
    
};

