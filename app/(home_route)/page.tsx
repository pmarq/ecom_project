import React from "react";
import { startDb } from "../lib/db";
import prisma from "@/prisma";
import GridView from "../components/GridView";
import ProductCard from "../components/ProductCard";
import FeaturedProductsSlider from "../components/FeaturedProducstSlider";
import HorizontalMenu from "../components/HorizontalMenu";
import CategoryMenu from "../components/CategoryMenu";

//como colocar uma quantidade (dentro do product table eu posso passar o fetch?? igual aqui?)

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
      price: { not: null as any }, //solução chat gpt**
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
  return products.map((product) => {
    return {
      id: product.id.toString(),
      title: product.title,
      description: product.description,
      category: product.category,
      thumbnail: product.thumbnails,
      price: product.price,
      sale: product.sale,
      rating: product.rating,
    };
  });
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
  return featuredProducts.map((featuredProducts) => {
    return {
      id: featuredProducts.id.toString(),
      title: featuredProducts.title,
      link: featuredProducts.link,
      linkTitle: featuredProducts.linkTitle,
      banner: featuredProducts.url,
    };
  });
};

let newArr: Props[] = [];

export default async function Home() {
  const latestProducts = await fetchLatestProducts();

  latestProducts.map((item) => {
    const prodPrice = item?.price;
    const strPrice = JSON.stringify(prodPrice);
    const obj = JSON.parse(strPrice);

    const newProdObj = {
      id: item.id.toString(),
      title: item?.title ?? "",
      description: item?.description ?? "",
      category: item?.category ?? "",
      thumbnail: item?.thumbnail[0].url,
      price: { base: obj.base, discounted: obj.discounted },
      sale: item.sale,
      rating: item.rating ?? 0,
    };

    newArr.push(newProdObj);
  });

  const featuredProducts = await fetchFeaturedProduct();

  return (
    <div className="py-4 space-y-4">
      <FeaturedProductsSlider products={featuredProducts} />
      <CategoryMenu />
      <GridView>
        {newArr.map((product: Props) => {
          return <ProductCard key={product.id} product={product} />;
        })}
      </GridView>
    </div>
  );
}
