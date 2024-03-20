import React from 'react'
import GridView from '@/app/components/GridView';
import HorizontalMenu from '@/app/components/HorizontalMenu';
import ProductCard from '@/app/components/ProductCard';
import { startDb } from '@/app/lib/db';
import prisma from '@/prisma';



//como colocar uma quantidade (dentro do product table eu posso passar o fetch?? igual aqui?)

interface LatestProducts {
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
}


const fetchProductByCategory = async (categories: string) => {
  await startDb()
  const products = await prisma.product.findMany({
    where: {      
      price: { not: null as any}, //solução chat gpt**,
      category: categories    
    },
    orderBy: {
      createdAt: "desc",     
    },
    
    select: {
      thumbnails: true,
      price: true,
      quantity: true,
      description:true,
      category: true,
      title: true,
      id: true,
      sale: true,
      createdAt: true,
    },      
  });
  return products.map((product) =>{
    return {
      id: product.id.toString(),
      title: product.title,
      description: product.description,
      category: product.category,
      thumbnail: product.thumbnails,
      price: product.price,
      sale: product.sale,
    }
  });
}  

let newArr: LatestProducts[] = [] 

interface Props {
    params: { categories: string }
}

export default async function ProductByCategory({params}: Props) {
  const products = await fetchProductByCategory(decodeURIComponent (params.categories));
  const parsedProducts = JSON.parse(JSON.stringify(products)) as LatestProducts[];

  products.map((item) =>{
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
      sale: item.sale      
    };   

    newArr.push(newProdObj)    

  });  


  return (
    <div className='py-4 space-y-4'>   
      <HorizontalMenu/>
     {parsedProducts.length?  <GridView>
      {newArr.map((product: LatestProducts) => {
        return <ProductCard key={product.id} product={product}/>
      })}
    </GridView>: <h1 className='text-center pt-10 font-semibold text-2xl opacity-40'>
        Sorry there are no products in this category!</h1>}
    </div>   
  )
}
