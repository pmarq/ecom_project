import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { startDb } from "@/app/lib/db";
import { ReviewRequestBody } from "@/app/types";
import prisma from "@/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "User not authenticated!" },
        { status: 401 }
      );
    }

    let userId;
    const { productId, comment, rating } =
      (await req.json()) as ReviewRequestBody;

    if (!productId) {
      return NextResponse.json(
        { error: "Invalid request, product missing!" },
        { status: 401 }
      );
    }

    if (rating <= 0 || rating > 5) {
      return NextResponse.json(
        { error: "Invalid request, rating must be between 1 and 5!" },
        { status: 401 }
      );
    }

    userId = session.user.id;

    await startDb();

    // Upsert the review
    const review = await prisma.reviewDocument.upsert({
      where: {
        userId_productId: {
          userId: userId,
          productId: productId,
        },
      },
      update: { comment, rating },
      create: { userId, productId, comment, rating },
    });

    // Calculate the average rating for the product
    const averageRating = await prisma.reviewDocument.aggregate({
      _avg: {
        rating: true,
      },
      where: {
        productId: productId,
      },
    });

    if (averageRating._avg.rating) {
      await prisma.product.update({
        where: { id: productId },
        data: { rating: averageRating._avg.rating },
      });
    }

    return NextResponse.json(
      {
        message: "Review successfully submitted!",
        review,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
