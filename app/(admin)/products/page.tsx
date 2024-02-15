import ProductTable from '@/app/components/ProductTable'
import React from 'react'

interface Props {
  searchParams: {page: string}
}


export default function Products({searchParams}: Props) {
  const {page = "1"} = searchParams

  return (
    <div>
        <ProductTable currentPageNo={+page} />
    </div>
  )
}
