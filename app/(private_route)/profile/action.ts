"use server";

import { startDb } from "@/app/lib/db";
import { UserProfileToUpdateUpdate } from "@/app/types";
import prisma from "@/prisma";

export const updateUserProfile = async (info: UserProfileToUpdateUpdate) => {  
    try {
        await startDb();
        const user = await prisma.user.update({
            where: {
                id: info.id
            },
            data: {
                name: info.name,
                image: info.avatar?.url
            }
        })    
    } catch (error) {
        console.error("Error updating user profile")
        throw error
    }   
   
}