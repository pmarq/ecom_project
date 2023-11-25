"use server"

import { startDb } from "@/app/lib/db"
import { NewProductInfo, Product } from "@/app/types"
import prisma from "@/prisma"
import {v2 as cloudinary} from "cloudinary"

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
    secure: true
})

export const getCloudConfig = async () => {
    return {
        name: process.env.CLOUD_NAME!,
        key: process.env.CLOUD_API_KEY!,
    }
}

// generate cloud signature

export const getCloudSigature = async () => {
    const  secret = cloudinary.config().api_secret as string
    const timestamp = Math.round(new Date().getTime() / 1000)
    const signature = cloudinary.utils.api_sign_request({
        timestamp
    }, secret)

    return {timestamp, signature}
}

// create product

export  const createProduct =async (info: Product) => {
    try {

    await startDb()  
    
     // Prepare bullet points data
     const bulletPointsData = info.bulletPoints?.map(content => ({
        content,
    }));

    // Create thumbnails data
    const thumbnailData = info.thumbnail ? [{ url: info.thumbnail }] : [];

    // Create images data
    const imagesData = info.images?.map(image => ({ url: image }));

    await prisma.product.create({
        data: {
            title: info.title,
            description: info.description,
            bulletPoints: {
                create: bulletPointsData,
            },
            thumbnails: {
                create: thumbnailData as any[],
            },
            images: {
                create: imagesData as any[],
            },
            mrp: info.mrp,
            salePrice: info.salePrice,
            quantity: info.quantity,
            category: info.category, 
            user: {
                connect: { id: info.userId },
            },                 
        },
    });
        
    
    } catch (error) {
        console.log((error as any).message);
        throw  new Error("Something went wrong, can not create product!")
        
    }
    
}