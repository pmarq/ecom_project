"use client"

import React from 'react'
import ProductForm from './ProductForm'
import { NewProductInfo, ProductResponse, ProductToUpdate } from '../types'
import { removeAndUpdateProductImage, removeImageFromCloud } from '../(admin)/products/action'

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


    const handleImageRemove = (source: string, index: number) => {
        const splittedData = source.split("/");
        const lastItem = splittedData[splittedData.length - 1];

        const publicId = lastItem.split(".")[0];

        const imageIdMongo = product.images?product.images[index].id:""

        removeAndUpdateProductImage(product.id, publicId, imageIdMongo)
    }

    //////////////// onSubmit***

    /* const handleOnSubmit = async (values: NewProductInfo) => {     

        const dataToUpdate: ProductToUpdate  = {
          title: values.title,
          description: values.description,
          bulletPoints: product.thumbnail?product.thumbnail[0].url:"",
          category: values.category,
          quantity: values.quantity,
          price: {
            base: values.mrp,
            discounted: values.salePrice
          }        
        }
                
        if (thumbnail) {
          const thumbnailRes = await removeImageFromCloud(product.thumbnail.id)
        }
    
        if (images && images.length > 0) {
          let resImgPromises = await uploadProductImages(images);
          imagesObj = resImgPromises;
        }
    
        const newObj = {
          userId,
          bulletPoints,
          category,
          description,
          mrp,
          quantity,
          salePrice,
          title,
          thumbnail: thumbnailObj,
          images: imagesObj,
        };
    
        createProduct(newObj);
      };
     */

  return (
    <ProductForm
     onImageRemove={handleImageRemove}
     initialValue={initialValue} 
     onSubmit= {(values) => {console.log(values)}}
     />   
  );
};
