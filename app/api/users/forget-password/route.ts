import { ForgetPasswordRequest } from "@/app/types"
import prisma from "@/prisma"
import { NextResponse } from "next/server";
import { startDb } from "@/app/lib/db";
import { createActivateResetToken } from "@/app/services/passwordTokenReset";
import nodemailer from "nodemailer"; 


export const POST = async (req: Request) => {
   
    try{
    
    const {email} = await req.json() as ForgetPasswordRequest
    if (!email) 
    return NextResponse.json({error: "Email not found!"}, {status: 401})
    const user = await prisma.user.findUnique({
        where: {
            email: email
        }
    });

    if (!user) 
    return NextResponse.json({error: "User not found!"}, {status: 404})
    
    // generate token and send link to the given email.

    await startDb();

    await prisma.activateResetToken.deleteMany({
        where: {userId : user.id}
     });   
     // Dúvida com relação porque deleteMany  

    const token = createActivateResetToken()  
    
    await prisma.activateResetToken.create({
        data: {
          userId: user.id,
          token:token                     
        }
     })

     // send the link to the given email.     

     const transport = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "29dc3a30787fa8",
          pass: "554f12abcbc072"
        }
      });      
      
    const resetPassLink = `${process.env.PASSWORD_RESET_URL}?token=${token}&userId=${user.id}`
    await transport.sendMail({
      from: "verification@nextecon.com",
      to: user.email as string,
      subject: "Verify Your Email",
      html: `<h1>Please click on <a href="${resetPassLink}">this link</a> to reset your password.</h1>`
    });

    return NextResponse.json({message: "Please check your e-mail!"})

    } catch (error) {
        
        return NextResponse.json({error: (error as any).message}, {status: 500})
    }
    
};