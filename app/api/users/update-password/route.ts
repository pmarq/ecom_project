import { UpdatePasswordRequest } from "@/app/types";
import { NextResponse } from "next/server";
import prisma from '@/prisma';
import bcrypt  from "bcrypt";
import { startDb } from '@/app/lib/db';

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
       console.log(user)
       if(!user) return NextResponse.json({error:"Invalid Request"}, {status: 404})
       
       const hashedPassword = await bcrypt.hash(password, 10)
       
       const updateUserPassword = await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            password: hashedPassword
        }
       })
       console.log(updateUserPassword)
       return NextResponse.json({message: "Your password has changed!"}, {status: 200})           
       
       ///??????

    } catch (error) {
        return NextResponse.json(
            {
                error: "could not update password, something went wrong!"
            },
            { status: 500 }
        );
    };
}  