import ProductTable from '@/app/components/ProductTable'
import React from 'react'



export default function Products() {
  return (
    <div>
        <ProductTable currentPageNo={0}  />
    </div>
  )
}
