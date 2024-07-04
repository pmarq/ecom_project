import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ReviewForm from "@/app/components/ReviewForm";
import { startDb } from "@/app/lib/db";
import prisma from "@/prisma";
import { getServerSession } from "next-auth";
import Image from "next/image";
import { redirect } from "next/navigation";

import React from "react";

interface Props {
  params: {
    id: string;
  };
}

const fetchReview = async (productId: string) => {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return redirect("/auth/signin");
  }

  await startDb();

  const review = await prisma.reviewDocument.findUnique({
    where: {
      userId_productId: {
        userId: session.user.id,
        productId: productId,
      },
    },
    include: {
      product: {
        select: {
          title: true,
          thumbnails: {
            select: {
              url: true,
            },
          },
        },
      },
    },
  });

  if (review) {
    return {
      id: review.id.toString(),
      rating: review.rating,
      comment: review.comment,
      productTitle: review.product.title,
      productThumbnailUrl: review.product.thumbnails[0]?.url || "",
    };
  }
};

export default async function Review({ params }: Props) {
  const productId = params.id;

  const review = await fetchReview(productId);

  const initialValue = review
    ? { rating: review.rating, comment: review.comment || "" }
    : undefined;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center space-x-4">
        <Image
          src={review?.productThumbnailUrl || ""}
          alt={review?.productTitle || ""}
          width={50}
          height={50}
          className="rounded"
        />
        <h3 className="font-semibold">{review?.productTitle}</h3>
      </div>
      <ReviewForm productId={productId} initialValue={initialValue} />
    </div>
  );
}
