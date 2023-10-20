import React from 'react';
import { redirect } from "next/navigation";
import prisma from '@/prisma';
import { startDb } from '@/app/lib/db';
import UpdatePassword from '@/app/components/UpdatePassword';

interface Props {
    searchParams: {
        token: string,
        userId: string
    }
}

/* // ???

const fetchTokenValidation = async (token: string , userId: string) => {
   const resetToken = await prisma.activateResetToken.findUnique({
        where: {
            userId: userId,
            token: token,
            createdAt: {gt: new Date(Date.now() - 1000 * 60 * 60 * 2) },
        },
    })

    console.log(resetToken)

    if(!resetToken) return null;
}
//??
 */

const fetchTokenValidation = async (token: string , userId: string) => {
    await startDb()
    const resetToken = await prisma.activateResetToken.findUnique({
        where: {
            userId: userId,
            token: token,
            createdAt: {gt: new Date(Date.now() - 1000 * 60 * 60 * 2) },
        },
       
    })
    if(!resetToken) return null;

    console.log(resetToken) 

     // criar um metodo de comparação     

    return true;  
}

export default async function ResetPassword({searchParams}:Props) {
    console.log(searchParams)
    const {token, userId} = searchParams   
    
    if(!token || !userId) return redirect("/404")

   const isValid = await fetchTokenValidation(token, userId)
   if(!isValid) return redirect("/404") 
    return(
     <UpdatePassword token={token} userId={userId} />
    )
}
