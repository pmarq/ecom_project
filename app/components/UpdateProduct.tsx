"use client"

import React from 'react'
import ProductForm from './ProductForm'
import { ProductResponse } from '../types'

interface Props {
   product: ProductResponse
}

export default function UpdateProduct({product}:Props) {   
    let img: string[] = []
    let bulletPoint: string[] = []

    product?.images?.map((item: { url: string; id:string }) => {
        const url = item.url;
        img.push(url);
    });

    product?.bulletPoints?.map((item: { id:string; content:string; productId:string }) =>{
        const content = item.content;
        bulletPoint.push(content)
    })



    const initialValue = {
        ...product,
        thumbnail: product.thumbnail?product.thumbnail[0].url:"",
        images: img,
        mrp: product.mrp,
        salePrice: product.salePrice,
        bulletPoints: bulletPoint,

    }
  return (
    <ProductForm initialValue={initialValue} onSubmit={(values)=>{
        console.log(values)
    }} />   
  )
}
