"use client";
import React, { startTransition } from "react";
import Image from "next/image";
import formatPrice from "../utils/helpers/formatPrice";
import { Button } from "@material-tailwind/react";
import Wishlist from "../ui/Wishlist";
import Link from "next/link";
import { toast } from "react-toastify";

interface Props {
  product: {
    id: string;
    title: string;
    thumbnails: string;
    price: { base: number; discounted: number };
  };
}

export default function WishlistProductCard({ product }: Props) {
  const { id, title, thumbnails, price } = product;
  const updateToWishlist = async () => {
    console.log("updateToWishlist");
    const res = await fetch("/api/product/wishlist", {
      method: "POST",
      body: JSON.stringify(product.id),
    });

    console.log({ res });

    const { error } = await res.json();
    if (!res.ok && error) {
      toast.error(error);
      return; // Ensure the function returns void here
    }
  };

  return (
    <div className="flex space-x-4 items-center">
      <Image src={thumbnails} alt={title} width={100} height={100} />
      <Link className="flex-1 h-full" href={`/${title}/${id}`}>
        <h1 className="text-lg text-blue-gray-700 font-semibold">{title}</h1>
        <p>{formatPrice(price.discounted)}</p>
      </Link>
      <Button variant="text" onClick={() => updateToWishlist()}>
        <Wishlist isActive />
      </Button>
    </div>
  );
}
