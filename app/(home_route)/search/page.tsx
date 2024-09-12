import GridView from "@/app/components/GridView";
import ProductCard from "@/app/components/ProductCard";
import SearchFilter from "@/app/components/SearchFilter";
import { startDb } from "@/app/lib/db";
import { resolveTypeJsonValues } from "@/app/utils/helpers/resolveTypeJsonValues";
import prisma from "@/prisma";
import { Prisma } from "@prisma/client";
import React from "react";

type Options = {
  query: string;
  priceSort?: "asc" | "desc";
  maxRating?: number;
  minRating?: number;
};

interface Props {
  searchParams: Options;
}

/* interface Props {
  searchParams: {
    query: string;
  };
} */

interface Product {
  id: string;
  title: string;
  thumbnail: string;
  description: string;
  price: Prisma.JsonValue;
  category: string;
  quantity: number;
  sale: number;
}

async function searchProducts(options: Options) {
  const { query, maxRating, minRating, priceSort } = options;
  await startDb();

  const filters: Prisma.ProductWhereInput = {
    title: {
      contains: query,
      mode: "insensitive",
    },
  };

  if (typeof minRating === "number" && typeof maxRating === "number") {
    filters.rating = {
      gte: minRating,
      lte: maxRating,
    };
  }

  const products = await prisma.product.findMany({
    where: filters,
    orderBy: {
      price: priceSort === "asc" ? "asc" : "desc",
    },
    select: {
      thumbnails: true,
      price: true,
      quantity: true,
      description: true,
      category: true,
      title: true,
      id: true,
      sale: true,
      createdAt: true,
      rating: true, // Assuming you have rating in your database
    },
  });

  const results = products.map((product) => {
    return {
      id: product.id.toString(),
      title: product.title,
      thumbnail: product.thumbnails[0]?.url,
      description: product.description,
      price: product.price,
      category: product.category,
      quantity: product.quantity,
      sale: product.sale,
      rating: product.rating, // Assuming you have rating in your database
    };
  });

  return results;
}

export default async function Search({ searchParams }: Props) {
  const { query, maxRating, minRating, priceSort } = searchParams;
  const results = await searchProducts({
    query,
    maxRating: maxRating ? +maxRating : undefined,
    minRating: minRating ? +minRating : undefined,
    priceSort,
  });

  const noProdcuts = !results.length;

  return (
    <div>
      <SearchFilter>
        {noProdcuts ? (
          <h1 className="text-xl font-semibold text-blue-gray-500 text-center">
            No products found
          </h1>
        ) : (
          <GridView>
            {results.map((product: Product) => {
              const newPrice = resolveTypeJsonValues(product.price);
              const newObj = { ...product, price: newPrice };
              return <ProductCard key={product.id} product={newObj} />;
            })}
          </GridView>
        )}
      </SearchFilter>
    </div>
  );
}
