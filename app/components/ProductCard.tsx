"use client";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  CardFooter,
  Chip,
} from "@material-tailwind/react";
import Image from "next/image";
import Link from "next/link";
import truncate from "truncate";
import useAuth from "../hooks/useAuth";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useTransition } from "react";
import Rating from "./Rating";

interface Props {
  product: {
    id: string;
    title: string;
    description: string;
    category: string;
    thumbnail: string;
    sale: number;
    rating?: number;
    price: {
      base: number;
      discounted: number;
    };
  };
}

const formatPrice = (amount: number) => {
  const formatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return formatter.format(amount);
};

export default function ProductCard({ product }: Props) {
  const { loggedIn } = useAuth();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleCheckout = async () => {
    const getUrl = await fetch("/api/checkout/instant", {
      method: "POST",
      body: JSON.stringify({ product, type: "instant-checkout" }),
    });

    const { error, url } = await getUrl.json();

    if (!getUrl.ok) {
      toast.error(error);
    } else {
      // open the checkout url.
      window.location.href = url;
    }
  };

  const addToCart = async (): Promise<void> => {
    if (!loggedIn) return router.push("/auth/signin");
    const res = await fetch("/api/product/cart", {
      method: "POST",
      body: JSON.stringify({ productId: product.id, quantity: 1 }),
    });
    const { error } = await res.json();
    if (!res.ok && error) {
      toast.error(error);
      return; // Ensure the function returns void here
    }
    router.refresh();
  };

  return (
    <Card className="w-full">
      <Link className="w-full" href={`/${product.title}/${product.id}`}>
        <CardHeader
          shadow={false}
          floated={false}
          className="relative w-full aspect-square m-0"
        >
          <Image src={product.thumbnail} alt={product.title} fill />
          <div className="absolute right-0 p-2">
            <Chip
              color="red"
              value={`${(product.sale * 100).toFixed(0)}% off`}
            />
          </div>
        </CardHeader>
        <CardBody>
          <div className="mb-2">
            <h3 className="line-clamp-1 font-medium text-blue-gray-800">
              {truncate(product.title, 50)}
            </h3>
            <div className="flex justify-end">
              {product.rating ? (
                <Rating value={parseFloat(product.rating.toFixed(1))} />
              ) : null}
            </div>
          </div>
          <div className="flex justify-end items-center space-x-2 mb-2">
            <Typography color="blue-gray" className="font-medium line-through">
              {formatPrice(product.price.base)}
            </Typography>
            <Typography color="blue-gray" className="font-medium">
              {formatPrice(product.price.discounted)}
            </Typography>
          </div>
          <p className="font-normal text-sm opacity-75 line-clamp-3">
            {product.description}
          </p>
        </CardBody>
      </Link>
      <CardFooter className="pt-0 space-y-4">
        <Button
          ripple={false}
          fullWidth={true}
          className="bg-blue-gray-900/10 text-blue-gray-900 shadow-none hover:shadow-none hover:scale-105 focus:shadow-none focus:scale-105 active:scale-100"
          onClick={() => {
            startTransition(async () => await addToCart());
          }}
          disabled={isPending}
        >
          Add to Cart
        </Button>
        <Button
          disabled={isPending}
          ripple={false}
          fullWidth={true}
          onClick={() => {
            startTransition(async () => await handleCheckout());
          }}
          className="bg-blue-400 text-white shadow-none hover:shadow-none hover:scale-105 focus:shadow-none focus:scale-105 active:scale-100"
        >
          Buy Now
        </Button>
      </CardFooter>
    </Card>
  );
}
