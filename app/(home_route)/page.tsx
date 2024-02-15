import React from 'react'
import { startDb } from '../lib/db'
import prisma from '@/prisma'
import GridView from '../components/GridView'
import ProductCard from '../components/ProductCard'

//como colocar uma quantidade (dentro do product table eu posso passar o fetch?? igual aqui?)

const fetchLatestProducts = async () => {
  await startDb()
  const products = await prisma.product.findMany({
    where: {      
      price: { not: null as any}, //solução chat gpt**    
    },
    orderBy: {
      createdAt: "desc"
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
      product: product.price,
      sale: product.sale,
    }
  });
}  


export default async function Home() {
  const latestProducts = await fetchLatestProducts()
  return (
    <GridView>
      {latestProducts.map(product =>{
        return <ProductCard product={product}/>
      })}
    </GridView>
  )
}


