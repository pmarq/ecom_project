import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/prisma";

import { startDb } from "@/app/lib/db";

export const POST = async (req: Request) => {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user) {
    return NextResponse.json(
      { error: "unauthorized request!" },
      { status: 403 }
    );
  }

  const { productId } = (await req.json()) as any;
  if (!productId) {
    return NextResponse.json({ error: "Invalid productId!" }, { status: 422 });
  }

  const userId = user.id;

  console.log("USER ID===>", userId);
  console.log("PRODUCT ID===>", productId);

  await startDb();

  const wishlist = await prisma.wishlist?.findFirst({
    where: {
      userId: userId,
    },
    include: { products: true }, // Including the related products
  });

  console.log("WISHLIST===>", wishlist);

  // If no wishlist exists, create one for the user
  if (!wishlist) {
    const newWishlist = await prisma.wishlist.create({
      data: {
        userId: userId,
        products: {
          create: {
            productId: productId,
          },
        },
      },
      include: { products: true },
    });
    console.log("Created new wishlist: ", wishlist);
    return NextResponse.json({ success: true, wishlist });
  }

  // Check if the product is already in the wishlist
  const isProductInWishlist = wishlist.products.some(
    (product) => product.productId === productId
  );

  console.log("IS PRODUCT IN WISHLIST", isProductInWishlist);

  // Remove or add the product from the wishlist
  if (isProductInWishlist) {
    // Find the wishlist product entry
    const wishlistProduct = await prisma.wishlistProduct.findFirst({
      where: {
        wishlistId: wishlist.id,
        productId: productId,
      },
    });

    // If the product is in the wishlist, remove it
    if (wishlistProduct) {
      await prisma.wishlistProduct.delete({
        where: { id: wishlistProduct.id },
      });

      console.log("Removed product from wishlist");
    }
  } else {
    // If the product is not in the wishlist, add it
    await prisma.wishlist.update({
      where: { id: wishlist.id },
      data: {
        products: {
          create: {
            productId: productId,
          },
        },
      },
    });

    console.log("Added product to wishlist");
  }

  return NextResponse.json({ success: true });
};
