import ProductTable from "@/app/components/ProductTable";
import { startDb } from "@/app/lib/db";
import prisma from "@/prisma";
import React from "react";

interface Props {
  searchParams: {
    query: string;
  };
}

const searchProducts = async (query: string) => {
  await startDb();
  const products = await prisma.product.findMany({
    where: {
      title: {
        contains: query,
        mode: "insensitive",
      },
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
    },
  });

  const results = products.map((product) => {
    return {
      id: product.id.toString(),
      title: product.title,
      thumbnails: product.thumbnails,
      description: product.description,
      price: product.price,
      category: product.category,
      quantity: product.quantity,
    };
  });

  return results;
};

export default async function AdminSearch({ searchParams }: Props) {
  const { query } = searchParams;
  const results = await searchProducts(query);
  return (
    <div>
      <ProductTable
        productsSearch={results}
        showPageNavigator={false}
        currentPageNo={0}
        query={query}
      />
    </div>
  );
}
