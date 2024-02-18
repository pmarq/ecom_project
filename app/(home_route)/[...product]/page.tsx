import ProductView from "@/app/components/ProductView"
import { startDb } from "@/app/lib/db"
import prisma from "@/prisma"
import { redirect } from "next/navigation"
import React from "react"

interface Props {
    params: {
        product: string[]
    }
}

const fetchProduct = async (productId: string) => {
    if(!productId) return redirect ('/404')

    await startDb()

    const product = await prisma.product.findUnique({
        where: {
            id: productId
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
            bulletPoints: true,
            createdAt: true,
            images: true
          },      
    })
    if(!product) return redirect ('/404')
    
    return JSON.stringify({
        id: product.id.toString(),
        title: product.title,
        description: product.description,
        category: product.category,
        thumbnail: product.thumbnails,
        price: product.price,
        sale: product.sale,
        images:product.images?.map((image) => image.publicId),
        points: product.bulletPoints?.map((point) => point.content)
      })
   
}

export default async function Product({params}: Props) {
   const {product} = params
   const productId = product[1]
   const productInfo = JSON.parse(await fetchProduct(productId))  
   let productImages =[productInfo.thumbnail]
   if(productInfo.images){
    productImages = productImages.concat(productInfo.images)
   }

    return (
        <ProductView 
            title={productInfo.title}
            description={productInfo.description}
            price={productInfo.price}
            sale={Math.floor(productInfo.sale * 100)}
            points={productInfo.points} 
            images={productImages}   
        
        />
    )
    
}