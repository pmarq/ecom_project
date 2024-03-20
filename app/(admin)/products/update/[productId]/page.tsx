import UpdateProduct from '@/app/components/UpdateProduct'
import React from 'react'
import { fetchProductInfo } from '../../action'

interface Props {
    params: {
        productId: string
    }
}   

export default async function UpdatePage(props: Props) {       
    const {productId} = props.params
    const product = await fetchProductInfo(productId)   
  return (
    <UpdateProduct product={JSON.parse(product)}/>   
  )
}
