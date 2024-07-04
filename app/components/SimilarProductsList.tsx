import React from "react";
import HorizontalMenu from "./HorizontalMenu";
import formatPrice from "../utils/helpers/formatPrice";
import Image from "next/image";
import { JsonValue } from "@prisma/client/runtime/library";
import { resolveTypeJsonValues } from "../utils/helpers/resolveTypeJsonValues";
import Link from "next/link";

interface Props {
  products: {
    id: string;
    title: string;
    thumbnail: string;
    price: JsonValue;
  }[];
}
export default function SimilarProductsList({ products }: Props) {
  return (
    <div className="py-6">
      <h1 className="font-semibold text-lg mb-4 text-blue-gray-600">
        Also you may like
      </h1>
      <HorizontalMenu>
        {products.map((product) => {
          const discountedPrice = resolveTypeJsonValues(product.price);
          return (
            <Link
              href={`/${product.title}/${product.id}`}
              className="w-[200] space-y-2 mr-4"
              key={product.id}
            >
              <div className="w-[200px] space-y-2 mr-4">
                <Image
                  width={500}
                  height={500}
                  src={product.thumbnail}
                  alt={product.title}
                  className="rounded"
                />
                <div>
                  <h2 className="text-sm line-clamp-3">{product.title}</h2>
                  <h2>{formatPrice(discountedPrice.discounted)}</h2>
                </div>
              </div>
            </Link>
          );
        })}
      </HorizontalMenu>
    </div>
  );
}
