import FeaturedProductForm from '@/app/components/FeaturedProductForm'
import FeaturedProductTable from '@/app/components/FeaturedProductTable'
import React from 'react'
import { fetchFeaturedProduct } from '../action'

export default async function AddFeaturedProduct() {
  const featuredProducts = await fetchFeaturedProduct()
  return (
    <div>
        <FeaturedProductForm/>
        <FeaturedProductTable products={featuredProducts}/>
    </div>
  )
}
