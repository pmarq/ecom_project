import { UpdatePasswordRequest } from "@/app/types";
import { NextResponse } from "next/server";
import prisma from '@/prisma';
import bcrypt  from "bcrypt";
import { startDb } from '@/app/lib/db';
import nodemailer from "nodemailer"

export const POST = async (req: Request) => {
    try {
        const {password, token, userId} = await req.json() as UpdatePasswordRequest
        console.log(password,token,userId)
        if(!password || !token || !userId) return NextResponse.json({error:"Invalid Request!"}, {status: 401})        

        await startDb()
        const resetToken = await prisma.activateResetToken.findUnique({
        where: {
            userId: userId,
            token: token,
            createdAt: {gt: new Date(Date.now() - 1000 * 60 * 60 * 2) },
        },       
    })
    console.log(resetToken)
       if(!resetToken) return NextResponse.json({error: "Invalid Request!"}, {status: 401});
      
      const user = await prisma.user.findUnique ({
        where: {
            id: userId
         }
       })       
       if(!user) return NextResponse.json({error:"Invalid Request"}, {status: 404})
       
       const hashedPassword = await bcrypt.hash(password, 10)
       
       await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            password: hashedPassword
        }
       })

       // como apagar o token do banco de dados??

      // send email password was updated.     

       const transport = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "29dc3a30787fa8",
          pass: "554f12abcbc072"
         }
         });            
     
         await transport.sendMail({
          from: "verification@nextecon.com",
          to: user.email as string,
          subject: "Password Update",
         html: `<h1>Your password now is changed!</h1>`
           }); 
           
           
           return NextResponse.json({message: "Your password now is changed!"}, {status: 200});           
       
       ///??????    
    
    } catch (error) {
        return NextResponse.json(
            {
                error: "Could not update password, something went wrong!"
            },
            { status: 500 }
        );
    };
}  