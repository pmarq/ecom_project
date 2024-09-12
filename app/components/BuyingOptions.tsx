"use client";

import React, { useState, useTransition } from "react";
import { Button } from "@material-tailwind/react";
import CartCountUpdater from "./CartCountUpdater";
import { useParams, useRouter } from "next/navigation";
import useAuth from "../hooks/useAuth";
import { toast } from "react-toastify";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import Wishlist from "../ui/Wishlist";

interface Props {
  wishlist?: boolean;
}

export default function BuyingOptions({ wishlist }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [isPending, startTransition] = useTransition();
  const { product } = useParams();
  const productId = product[1];
  const { loggedIn } = useAuth();
  const router = useRouter();

  const handleIncrement = () => {
    setQuantity((prevCount) => prevCount + 1);
  };

  const handleDecrement = () => {
    if (quantity === 0) return;
    setQuantity((prevCount) => prevCount - 1);
  };

  // Promise<void> chatgpt solution ****

  const addToCart = async (): Promise<void> => {
    if (!productId) return;
    if (!loggedIn) return router.push("/auth/signin");
    const res = await fetch("/api/product/cart", {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    });
    const { error } = await res.json();
    if (!res.ok && error) {
      toast.error(error);
      return; // Ensure the function returns void here
    }
    router.refresh();
  };

  const updateToWishlist = async (): Promise<void> => {
    if (!productId) return;
    if (!loggedIn) return router.push("/auth/signin");
    const res = await fetch("/api/product/wishlist", {
      method: "POST",
      body: JSON.stringify({ productId }),
    });
    const { error } = await res.json();
    if (!res.ok && error) {
      toast.error(error);
      return; // Ensure the function returns void here
    }
    router.refresh();
  };

  return (
    <div className="flex items-center space-x-2">
      <CartCountUpdater
        onDecrement={handleDecrement}
        onIncrement={handleIncrement}
        value={quantity}
      />

      <Button
        onClick={() => {
          startTransition(async () => await addToCart());
        }}
        variant="text"
        disabled={isPending}
        color="blue"
      >
        Add to Cart
      </Button>
      <Button disabled={isPending} color="amber" className="rounded-full">
        Buy Now
      </Button>

      <Button
        onClick={() => {
          startTransition(async () => await updateToWishlist());
        }}
        variant="text"
        disabled={isPending}
      >
        <Wishlist isActive={wishlist} />
      </Button>
    </div>
  );
}
