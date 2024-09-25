import React from "react";
import { startDb } from "../lib/db";
import prisma from "@/prisma";
import GridView from "../components/GridView";
import ProductCard from "../components/ProductCard";
import CategoryMenu from "../components/CategoryMenu";

interface Props {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  sale: number;
  price: {
    base: number;
    discounted: number;
  };
  rating: number;
}

const fetchLatestProducts = async () => {
  await startDb();
  const products = await prisma.product.findMany({
    where: {
      price: { not: null as any },
    },
    orderBy: {
      createdAt: "desc",
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
      rating: true,
    },
  });

  return products.map((product) => ({
    id: product.id.toString(),
    title: product.title,
    description: product.description,
    category: product.category,
    thumbnail: product.thumbnails[0].url, // Assuming the first thumbnail
    price: {
      base: product.price.base,
      discounted: product.price.discounted,
    },
    sale: product.sale,
    rating: product.rating,
  }));
};

const fetchFeaturedProduct = async () => {
  await startDb();
  const featuredProducts = await prisma.featuredProduct.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      link: true,
      linkTitle: true,
      title: true,
      createdAt: true,
      url: true,
    },
  });
  return featuredProducts.map((featuredProduct) => ({
    id: featuredProduct.id.toString(),
    title: featuredProduct.title,
    link: featuredProduct.link,
    linkTitle: featuredProduct.linkTitle,
    banner: featuredProduct.url,
  }));
};

export const getServerSideProps = async () => {
  const latestProducts = await fetchLatestProducts();
  const featuredProducts = await fetchFeaturedProduct();

  return {
    props: {
      latestProducts,
      featuredProducts,
    },
  };
};

const Home = ({ latestProducts }: { latestProducts: Props[] }) => {
  return (
    <div className="py-4 space-y-4">
      <CategoryMenu />
      <GridView>
        {latestProducts.map((product: Props) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </GridView>
    </div>
  );
};

export default Home;
