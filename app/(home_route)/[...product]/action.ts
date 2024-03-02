"use server";

import { startDb } from "@/app/lib/db";
import prisma from "@/prisma";
import { redirect } from "next/navigation";


export const fetchProduct = async (productId: string) => {
    if (!productId) return redirect('/404');

    await startDb();

    try {
        const product = await prisma.product.findUnique({
            where: {
                id: productId
            },
            select: {
                thumbnails: true,
                price: true,
                quantity: true,
                description: true,
                category: true,
                title: true,
                id: true,
                sale: true,
                bulletPoints: true,
                createdAt: true,
                images: true
            }
        });

        if (!product) return redirect('/404');

        return JSON.stringify({
            id: product.id.toString(),
            title: product.title,
            description: product.description,
            category: product.category,
            thumbnail: product.thumbnails[0].url,
            price: product.price,
            sale: product.sale,
            images: product.images?.map((image) => image.url),
            points: product.bulletPoints?.map((point) => point.content)
        });
    } catch (error) {
        // Log the error for debugging purposes
        console.error("Error fetching product:", error);
        // Handle the error gracefully, for example, by redirecting to an error page
        return redirect('/error');
    }
};