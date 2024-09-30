import React from "react";
import { startDb } from "../lib/db";
import prisma from "@/prisma";

// Função para buscar o produto mais recente
const fetchLatestProducts = async () => {
  await startDb();

  const products = await prisma.product.findMany({
    where: {
      price: { not: null as any },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 1, // Limit to only 1 product to avoid large data
    select: {
      title: true,
      price: true,
      description: true,
    },
  });

  return products;
};

// Server component that renders the page
export default async function Home() {
  try {
    const latestProducts = await fetchLatestProducts(); // Fetch only one product
    console.log("Fetched Product:", latestProducts); // Log the fetched product

    return (
      <div>
        <h1>Latest Product</h1>
        {latestProducts.length > 0 ? (
          <div>
            <p>Title: {latestProducts[0].title}</p>
            <p>Description: {latestProducts[0].description}</p>
            {/*  <p>Price: {latestProducts[0].price.base}</p> */}
          </div>
        ) : (
          <p>No products available</p>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error fetching product:", error);
    return <p>Error loading product. Please try again later.</p>;
  }
}
