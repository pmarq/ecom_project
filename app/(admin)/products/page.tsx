import ProductTable from '@/app/components/ProductTable'
import prisma from '@/prisma'
import React from 'react'



export default function Products() {
  return (
    <div>
        <ProductTable currentPageNo={0}  />
    </div>
  )
}
