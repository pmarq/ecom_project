import ProductView from "@/app/components/ProductView"
import React from "react"
import { fetchProduct } from "./action"

interface Props {
    params: {
        product: string[]
    }
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