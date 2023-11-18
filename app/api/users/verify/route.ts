import prisma from "@/prisma";
import { NextResponse } from "next/server";
import { createActivateToken } from "@/app/services/emailVerificationToken";
import nodemailer from "nodemailer"; 
import { startDb } from "@/app/lib/db";



export const POST = async (req: Request) => {

    try{      

    const { token, userId } = await req.json()     
    const user = await prisma.user.findFirst({
      where: {id: userId}

    });

    if (!user) {
      return NextResponse.json ({message: "User not found!"},{status: 400});
    } ; 
    
    const activeToken = await prisma.activateToken.findFirst({
        where: {userId : user.id}
     });   

     if (!activeToken) {
      return NextResponse.json ({message: "User alredy verified"},{status: 400});
    } 

    if (token !== activeToken.token) {
      return NextResponse.json ({message: "Token incorrect"},{status: 400});
    }

    await prisma.user.update({
      where: {id: user.id},
      data: {emailVerified: true}
    })    

    await prisma.activateToken.delete({
      where: {id: activeToken.id}
    })

    return NextResponse.json ({message: "User verified"},{status: 200});
  
  } catch (error) {

        return NextResponse.json(
            {
            error: "Could not verify email, Something went wrong!",
             }, 
        { status: 500 })
     }  

    };


    export const  GET = async (req: Request) => {
      try{ 
        const userId = req.url.split("?userId=")[1]
        if(!userId) return NextResponse.json({error: "Invalid request, user id missing!"}, {status:401});

        await startDb()       
       
        
        const user = await prisma.user.findUnique({
          where: {
           id: userId
          }
        })

        if(prisma.activateToken){
          await prisma.activateToken.deleteMany({
            where:{
              userId:userId
            }
          })
        }

        if(!user) return NextResponse.json({error: "Invalid request, user not found!"}, {status: 401})

        if(user.emailVerified === true) return NextResponse.json({error: "Invalid request, user already verified!"}, {status: 401})

        const token = createActivateToken()  
        
        await prisma.activateToken.create({
        data: {
          token:token,
          userId: user.id
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
    
          
          const verificationLink = `http://localhost:3000/verifyPage?token=${token}&userId=${user.id}`;
          await transport.sendMail({
            from: "verification@nextecon.com",
            to: user.email as string,
            subject: "Verify Your Email",
            html: `<h1>Please verify your e-mail by clicking on <a href="${verificationLink}">This link</a></h1>`
          });
      
  
      return NextResponse.json ({message: "Please check your e-mail"},{status: 200});
    
    } catch (error) {
  
          return NextResponse.json(
              {
              error: "Could not verify email, Something went wrong!",
               }, 
          { status: 500 })
       }  
  
      };