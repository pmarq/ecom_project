"use client";
import React, { startTransition, useTransition } from "react";
import Image from "next/image";
import formatPrice from "../utils/helpers/formatPrice";
import { Button } from "@material-tailwind/react";
import Wishlist from "../ui/Wishlist";
import Link from "next/link";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

interface Props {
  product: {
    id: string;
    title: string;
    thumbnails: string;
    price: { base: number; discounted: number };
  };
}

export default function WishlistProductCard({ product }: Props) {
  const [isPending, startTransition] = useTransition();

  const router = useRouter();

  const { id, title, thumbnails, price } = product;

  const updateToWishlist = async (): Promise<void> => {
    if (!id) return;
    const res = await fetch("/api/product/wishlist", {
      method: "POST",
      body: JSON.stringify({ productId: id }),
    });
    const { error } = await res.json();
    if (!res.ok && error) {
      toast.error(error);
      return; // Ensure the function returns void here
    }
    router.refresh();
  };

  return (
    <div className="flex space-x-4 items-center">
      <Image src={thumbnails} alt={title} width={100} height={100} />
      <Link className="flex-1 h-full" href={`/${title}/${id}`}>
        <h1 className="text-lg text-blue-gray-700 font-semibold">{title}</h1>
        <p>{formatPrice(price.discounted)}</p>
      </Link>
      <Button
        variant="text"
        onClick={() => {
          startTransition(async () => await updateToWishlist());
        }}
      >
        <Wishlist isActive />
      </Button>
    </div>
  );
}
