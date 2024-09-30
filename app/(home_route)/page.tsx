import React from "react";
import { startDb } from "../lib/db";
import prisma from "@/prisma";

// Interface para o objeto Price
interface Price {
  base: number;
  discounted: number;
}

// Interface para o objeto Produto
interface ProductProps {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  sale: number;
  price: Price;
  rating?: number;
}

// Função para verificar se um valor é um objeto 'Price'
const isPriceObject = (price: any): price is Price => {
  return (
    typeof price === "object" &&
    price !== null &&
    "base" in price &&
    "discounted" in price &&
    typeof price.base === "number" &&
    typeof price.discounted === "number"
  );
};

// Função para buscar o produto mais recente
// Função para buscar os produtos mais recentes
const fetchLatestProducts = async () => {
  await startDb();

  const products = await prisma.product.findMany({
    where: {
      price: { not: null as any },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10, // Limita a busca para evitar sobrecarga de dados
    select: {
      thumbnails: true,
      price: true,
      description: true,
      category: true,
      title: true,
      id: true,
      sale: true,
      createdAt: true,
      rating: true,
    },
  });

  return products.map((product) => {
    const price: Price = isPriceObject(product.price)
      ? product.price
      : { base: 0, discounted: 0 };

    // Verificação robusta para garantir que thumbnails seja sempre um array válido
    const thumbnailUrl =
      Array.isArray(product.thumbnails) && product.thumbnails.length > 0
        ? product.thumbnails[0].url
        : "";

    return {
      id: product.id.toString(),
      title: product.title,
      description: product.description,
      category: product.category,
      thumbnail: thumbnailUrl,
      price: {
        base: price.base,
        discounted: price.discounted,
      },
      sale: product.sale,
      rating: product.rating ?? 0,
    };
  });
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
            <p>Category: {latestProducts[0].category}</p>
            <p>Thumbnail: {latestProducts[0].thumbnail}</p>
            <p>Sale: {latestProducts[0].sale}</p>
            <p>Rating: {latestProducts[0].rating}</p>
            <p>Price: {latestProducts[0].price.base}</p>
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
