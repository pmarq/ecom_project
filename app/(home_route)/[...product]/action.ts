"use server";

import { startDb } from "@/app/lib/db";
import prisma from "@/prisma";
import { redirect } from "next/navigation";

export const fetchProduct = async (productId: string) => {
  if (!productId) return redirect("/404");

  await startDb();

  console.log("primeiro")

  try {
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
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
        images: true,
        rating: true,
      },
    });

    if (!product) return redirect("/404");

    return JSON.stringify({
      id: product.id.toString(),
      title: product.title,
      description: product.description,
      category: product.category,
      thumbnail: product.thumbnails[0].url,
      price: product.price,
      sale: product.sale,
      images: product.images?.map((image) => image.url),
      points: product.bulletPoints?.map((point) => point.content),
      rating: product.rating,
      outOfStock: product.quantity <= 0,
    });
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error fetching product:", error);
    // Handle the error gracefully, for example, by redirecting to an error page
    return redirect("/error");
  }
};

export const updateOrCreateHistory = async (
  ownerId: string,
  productId: string
) => {
  console.log("INFO===>", ownerId, productId);
  // Check if a history record exists for the given owner and product
  const existingHistory = await prisma.history.findUnique({
    where: {
      ownerId_productId: {
        ownerId,
        productId,
      },
    },
  });

  if (existingHistory) {
    // Update the date if the history record exists
    await prisma.history.update({
      where: {
        id: existingHistory.id,
      },
      data: {
        date: new Date(),
      },
    });
  } else {
    // Create a new history record if it does not exist
    await prisma.history.create({
      data: {
        ownerId,
        productId,
        date: new Date(),
      },
    });
  }
};
