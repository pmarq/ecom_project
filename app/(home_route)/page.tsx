import React from "react";
import { startDb } from "../lib/db";
import prisma from "@/prisma";
import CategoryMenu from "../components/CategoryMenu";
import GridView from "../components/GridView";
import ProductCard from "../components/ProductCard";

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

// Server Component que renderiza a página
export default async function Home() {
  try {
    const latestProducts = await fetchLatestProducts(); // Buscando produtos diretamente

    return (
      <div className="py-4 space-y-4">
        <CategoryMenu />
        <GridView>
          {latestProducts.length > 0 ? (
            latestProducts.map((product: ProductProps) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <p>No products available</p>
          )}
        </GridView>
      </div>
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    return <p>Error loading products. Please try again later.</p>;
  }
}
