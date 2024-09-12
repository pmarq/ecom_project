import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import WishlistProductCard from "@/app/components/WishlistProductCard";
import { startDb } from "@/app/lib/db";
import { resolveTypeJsonValues } from "@/app/utils/helpers/resolveTypeJsonValues";
import prisma from "@/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import React from "react";

const fetchProduct = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return redirect("/auth/signin");
  }

  await startDb();

  const userId = session.user.id;

  // Fetch wishlist with product details included
  const wishlist = await prisma.wishlist.findFirst({
    where: { userId },
    include: {
      products: {
        include: {
          product: {
            select: {
              id: true,
              price: true,
              thumbnails: true,
              title: true,
            },
          },
        },
      },
    },
  });

  if (!wishlist) return [];
  // No need to fetch products separately, use the included data
  const products = wishlist?.products.map((item) => item.product) || [];

  console.log({ products });

  return products.map(({ id, title, price, thumbnails }) => {
    console.log({ id, title, price, thumbnails });
    return {
      id: id,
      title: title,
      price: resolveTypeJsonValues(price),
      thumbnails: thumbnails[0].url,
    };
  }); // Return the product array to use later
};

export default async function Wishlist() {
  const products = await fetchProduct();

  if (!products)
    return (
      <h1 className="text-2xl opacity-50 text-center p-6 font-semibold">
        There is no products inside your Wishlist
      </h1>
    );

  console.log({ products });

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-semibold">Your Wishlist</h1>

      {products.map((product) => (
        <WishlistProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
