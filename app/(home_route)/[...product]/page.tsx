import ProductView from "@/app/components/ProductView";
import React from "react";
import { fetchProduct, updateOrCreateHistory } from "./action";
import Link from "next/link";
import { startDb } from "@/app/lib/db";
import prisma from "@/prisma";
import ReviewsList from "@/app/components/ReviewList";
import SimilarProductsList from "@/app/components/SimilarProductsList";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

interface Props {
  params: {
    product: string[];
  };
}

// Fetch reviews with related product and user data

const fetchReviews = async (productId: string) => {
  await startDb();
  const reviews = await prisma.reviewDocument.findMany({
    where: {
      productId: productId,
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
      user: {
        select: {
          name: true,
          image: true, // Assuming 'image' is the avatar field in the User model
        },
      },
    },
  });
  const result = reviews.map((review) => {
    return {
      id: review.id.toString(),
      rating: review.rating,
      comment: review.comment,
      productTitle: review.product.title,
      productThumbnailUrl: review.product.thumbnails[0]?.url || "",
      userName: review.user.name,
      userAvatar: review.user.image,
      date: review.createdAt.toString(),
    };
  });
  return result;
};

// NÃO ENTENDI NO CURSO!! ***
const fetchSimilarProducts = async (productId: string) => {
  await startDb();
  const products = await prisma.product.findMany({
    where: {
      id: {
        not: productId,
      },
      rating: {
        gt: 3, // Ensures only products with a rating greater than 4 are fetched
      },
    },
    select: {
      id: true,
      title: true,
      price: true,
      thumbnails: {
        select: {
          url: true,
        },
      },
    },
    orderBy: {
      rating: "desc", // Sort by rating in descending order
    },
    take: 10, // Limit the results to a maximum of 10 products
  });

  const productsList = products.map((product) => {
    return {
      id: product.id.toString(),
      title: product.title,
      thumbnail: product.thumbnails[0]?.url || "",
      price: product.price,
    };
  });

  return productsList;
};

export default async function Product({ params }: Props) {
  const { product } = params;
  const productId = product[1];

  const productInfo = JSON.parse(await fetchProduct(productId));
  let productImages = [productInfo.thumbnail];
  if (productInfo.images) {
    productImages = productImages.concat(productInfo.images);
  }

  const result = await fetchReviews(productId);
  const similarProducts = await fetchSimilarProducts(productId);

  let isWishlist = false;

  const session = await getServerSession(authOptions);
  const owner = session?.user?.id;
  if (owner) {
    await updateOrCreateHistory(owner, productId);
    const wishlist = await prisma.wishlist.findFirst({
      where: {
        userId: owner,
      },
      include: {
        products: true,
      },
    });
    const wishlistProduct = wishlist?.products.some(
      (product) => product.productId === productId
    );
    isWishlist = wishlistProduct ? true : false;
  }

  console.log("isWishlist===>", isWishlist);

  return (
    <div className="p-4">
      <ProductView
        title={productInfo.title}
        description={productInfo.description}
        price={productInfo.price}
        sale={Math.floor(productInfo.sale * 100)}
        points={productInfo.points}
        images={productImages}
        rating={productInfo.rating}
        outOfStock={productInfo.outOfStock}
        isWishlist={isWishlist}
      />

      <SimilarProductsList products={similarProducts} />

      <div className="py-4 space-y-4">
        <div className="flex justify-between items-center"></div>
        <h1 className="text-2xl font-semibold mb-2">Reviews</h1>
        <Link href={`/add-review/${productInfo.id}`}>Add Review</Link>
      </div>
      <ReviewsList reviews={result} />
    </div>
  );
}
