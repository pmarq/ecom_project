"use client";
import Image from "next/image";
import React, { useState } from "react";
import { formatPrice } from "../utils/helper";
import { Button } from "@material-tailwind/react";
import CartCountUpdater from "./CartCountUpdater";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export interface Product {
  id: string;
  quantity: number;
  productId: string;
  cartDocumetId: string;
  price: { discounted: number };
  thumbnails: { url: string }[];
  title: string;
} 

interface CartItemsProps {
  products: Product[];
  cartTotal: number;
  totalQty: number;
  cartId: string;
}

const CartItems: React.FC<CartItemsProps> = ({
  products = [],
  totalQty,
  cartTotal,
}) => {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const updateCart = async (prodcutId: string, quantity: number) => {
    setBusy(true)
    await fetch('/api/product/cart', {
      method: 'POST',    
      body: JSON.stringify({  
        productId: prodcutId,
        quantity: quantity           
      })
    })  
    router.refresh() 
    setBusy(false)
  }

  return (
    <div>
      <table className="min-w-full divide-y divide-gray-200">
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product) => (
            <tr key={product.id}>
              <td className="py-4">
                <Image
                  src={product.thumbnails[0].url}
                  alt={product.title}
                  height={40}
                  width={40}
                />
              </td>
              <td className="py-4">{product.title}</td>
              <td className="py-4 font-semibold">
                {formatPrice((product.price.discounted*product.quantity))} {/* isso está certo? */}
              </td>
              <td className="py-4">
                <CartCountUpdater 
                onDecrement={() => updateCart(product.productId, - 1)} 
                onIncrement={() => updateCart(product.productId,  1)} 
                value={product.quantity} disabled={busy} />
              </td>
              <td className="py-4 text-right">
                <button
                  onClick={() => updateCart(product.productId, -product.quantity)}
                  disabled={busy}
                  className="text-red-500"
                  style={{ opacity: busy ? "0.5" : "1" }}
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex flex-col justify-end items-end space-y-4">
        <div className="flex justify-end space-x-4 text-blue-gray-800">
          <p className="font-semibold text-2xl">Total</p>
          <div>
            <p className="font-semibold text-2xl">{formatPrice(cartTotal)}</p>
            <p className="text-right text-sm">{totalQty} items</p>
          </div>
        </div>
        <Button
          className="shadow-none hover:shadow-none  focus:shadow-none focus:scale-105 active:scale-100"
          color="green"
          disabled={busy}
        >
          Checkout
        </Button>
      </div>
    </div>
  );
};

export default CartItems;
