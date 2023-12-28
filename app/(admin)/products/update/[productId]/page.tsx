import UpdateProduct from '@/app/components/UpdateProduct'
import { startDb } from '@/app/lib/db'
import { ProductResponse } from '@/app/types'
import prisma from '@/prisma'
import { redirect } from 'next/navigation'
import React from 'react'

interface Props {
    params: {
        productId: string
    }
}

const fetchProductInfo = async (productId: string): Promise<string> => {
    await startDb()

    const validProduct = await prisma.product.findUnique({
        where: {
            id:productId
        }
    });
    
    if(!validProduct) return redirect ('/404')         

    const product = await prisma.product.findUnique({       
            where: {
               id:productId
            },
            select: {
                id: true,
                title: true,
                quantity: true,
                price: true,
                description: true,
                category: true,
                bulletPoints: true,
                thumbnails: true,
                images: true
            }
        })  

        const finalProduct : ProductResponse  = {
            id: product?.id.toString(),
            title: product?.title,
            description: product?.description,
            quantity: product?.quantity,
            price: product?.price,
            bulletpoints: product?.bulletPoints,
            images: product?.images.map(({url, id})=>{
                return {url, id}
            }),
            thumbnail: product?.thumbnails,
            category: product?.category
        }
        return JSON.stringify(finalProduct)
    }   
   

export default async function UpdatePage(props: Props) {
    const {productId} = props.params
    const product = await fetchProductInfo(productId)
    console.log(product)
  return (
    <UpdateProduct product={JSON.parse(product)}/>   
  )
}
