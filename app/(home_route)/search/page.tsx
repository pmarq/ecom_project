import GridView from "@/app/components/GridView";
import ProductCard from "@/app/components/ProductCard";
import SearchFilter from "@/app/components/SearchFilter";
import { startDb } from "@/app/lib/db";
import { ProductForSearch } from "@/app/types";
import prisma from "@/prisma";
import React from "react";

async function searchProducts(query: string = "") {
  await startDb();

  const products = await prisma.product.findMany({
    where: {
      title: {
        contains: "",
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
      thumbnail: product.thumbnails[0]?.url,
      description: product.description,
      price: product.price,
      category: product.category,
      quantity: product.quantity,
    };
  });

  console.log("RESULTS===>", results);

  return results;
}

export default async function Search() {
  const results = await searchProducts();
  return (
    <div>
      <SearchFilter>
        <GridView>
          {results.map((product: any) => {
            return <ProductCard key={product.id} product={product} />;
          })}
        </GridView>
      </SearchFilter>
    </div>
  );
}
