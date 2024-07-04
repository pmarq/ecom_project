"use client";
import Image from "next/image";
import React, { useState } from "react";
import { Button } from "@material-tailwind/react";
import CartCountUpdater from "./CartCountUpdater";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { JsonValue } from "@prisma/client/runtime/library";
import { resolveTypeJsonValues } from "../utils/helpers/resolveTypeJsonValues";
import { toast } from "react-toastify";

export interface Product {
  id: string;
  title?: string | undefined;
  price?: JsonValue | undefined;
  thumbnails?:
    | {
        id: string;
        url: string;
        publicId: string;
        productId: string;
      }[]
    | undefined;
  quantity: number;
  productId: string;
  cartDocumentId: string;
}

interface CartItemsProps {
  cartId?: string;
  products: Product[];
  cartTotal: number;
  totalQty: number;
}

const formatPrice = (amount: number) => {
  const formatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return formatter.format(amount);
};

const CartItems: React.FC<CartItemsProps> = ({
  products = [],
  totalQty,
  cartTotal,
  cartId,
}) => {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const updateCart = async (prodcutId: string, quantity: number) => {
    setBusy(true);
    await fetch("/api/product/cart", {
      method: "POST",
      body: JSON.stringify({
        productId: prodcutId,
        quantity: quantity,
      }),
    });
    router.refresh();
    setBusy(false);
  };

  const handleCheckout = async () => {
    setBusy(true);
    const getUrl = await fetch("/api/checkout", {
      method: "POST",
      body: JSON.stringify({ cartId }),
    });

    const { error, url } = await getUrl.json();

    if (!getUrl.ok) {
      toast.error(error);
    } else {
      // open the checkout url.
      window.location.href = url;
    }
    setBusy(false);
  };

  return (
    <div>
      <table className="min-w-full divide-y divide-gray-200">
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product) => {
            const quantity = product.quantity;
            const price = resolveTypeJsonValues(product?.price);

            const discounted = price?.discounted ?? 1;
            const multiplication = discounted * quantity;

            const thumbnails = product?.thumbnails
              ? product.thumbnails[0]?.url
              : "";
            return (
              <tr key={product.id}>
                <td className="py-4">
                  <Image
                    src={thumbnails ?? ""}
                    alt={product?.title ?? ""}
                    height={40}
                    width={40}
                  />
                </td>
                <td className="py-4">{product.title}</td>
                <td className="py-4 font-semibold">
                  {formatPrice(multiplication)}
                </td>
                <td className="py-4">
                  <CartCountUpdater
                    onDecrement={() => updateCart(product.productId, -1)}
                    onIncrement={() => updateCart(product.productId, 1)}
                    value={quantity}
                    disabled={busy}
                  />
                </td>
                <td className="py-4 text-right">
                  <button
                    onClick={() => updateCart(product.productId, -quantity)}
                    disabled={busy}
                    className="text-red-500"
                    style={{ opacity: busy ? "0.5" : "1" }}
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="flex flex-col justify-end items-end space-y-4">
        <div className="flex justify-end space-x-4 text-blue-gray-800">
          <p className="font-semibold text-2xl">Total</p>
          <div>
            <p className="font-semibold text-2xl">{formatPrice(cartTotal)}</p>
            <p className="text-right text-sm">{totalQty} item(s)</p>
          </div>
        </div>
        <Button
          className="shadow-none hover:shadow-none  focus:shadow-none focus:scale-105 active:scale-100"
          color="green"
          disabled={busy}
          onClick={handleCheckout}
        >
          Checkout
        </Button>
      </div>
    </div>
  );
};

export default CartItems;
