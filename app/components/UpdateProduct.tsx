"use client"

import React from 'react'
import ProductForm from './ProductForm'
import { ProductResponse } from '../types'

interface Props {
   product: ProductResponse
}

export default function UpdateProduct({product}:Props) {   
    const initialValue = {
        ...product,
        thumbnail: product.thumbnail?.url,
        images: product.images?.map(({url}) => url),
        mrp: product.mrp,
        salePrice: product.salePrice,
        bulletPoints: product.bulletPoints || [],

    }
  return (
    <ProductForm initialValue={initialValue} onSubmit={(values)=>{
        console.log(values)
    }} />   
  )
}
