"use client"

import React from 'react'
import ProductForm from './ProductForm'
import { BulletPoints, NewProductInfo, ProductDataToUpdate, ProductResponse, ProductToUpdate, image } from '../types'
import { deleteBulletPoint, removeAndUpdateProductImage, removeImageFromCloud, updateProduct } from '../(admin)/products/action'
import { uploadImage } from '../utils/helper'
import { useRouter } from 'next/navigation'



interface Props {
   product: ProductResponse
}

export default function UpdateProduct({product}:Props) {   
    const router = useRouter();
    let img: string[] = []
    let bulletPoint: BulletPoints[] = [];

    product?.images?.map((item: { url: string; id: string }) => {
        const url = item.url;
        img.push(url);
    });

    product?.bulletPoints?.map(
      (item: { id: string; content: string; productId: string }) => {
        const content = item.content;       
        bulletPoint.push(item);
      }
    );

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

        const imageIdMongo = product.images ? product.images[index].id:""

        removeAndUpdateProductImage(product.id, publicId, imageIdMongo)
    }
    

   ////// onSubmit ***


   const handleOnSubmit = async (values: NewProductInfo) => { 
    
    try {      
      const {thumbnail, imagesFiles} = values

      const dataToUpdate: ProductDataToUpdate = {
        title: values.title,
        description: values.description,
        bulletPoints: values.bulletPoints,
        category: values.category,
        quantity: values.quantity,
        price: {
          base: values.mrp,
          discounted: values.salePrice,
        },
        thumbnailId: product.thumbnail?product.thumbnail[0].id:''
      };
    

      if (thumbnail) {       
 
        //Seria pelo initialValue que está sendo puxado pelo ProductResponse do fetchProductInfo.

        const source = initialValue.thumbnail
        const splittedData = source.split("/")
       
        const lastItem = splittedData[splittedData.length -1];
        const publicIdOld = lastItem.split(".")[0]; 
        await removeImageFromCloud(publicIdOld);

        const { publicId, url } = await uploadImage(thumbnail)
        dataToUpdate.thumbnail = {publicId, url}
      }

        if(imagesFiles.length) {
          const uploadPromise = imagesFiles.map(async(imgFile:File) => {
            return await uploadImage(imgFile)
          })
          dataToUpdate.images = await Promise.all(uploadPromise)         
      }
            
      updateProduct(product.id, dataToUpdate)
 
      router.refresh();
      router.push('/products');
      
    } catch (error) {
      console.log("erro" + error);      
    }
  };

  function handleBulletPointRemove(values: BulletPoints) {
    deleteBulletPoint({
      id: values.id,
      content: values.content,
      productId: values.productId
    });
  }



  return (
    <ProductForm
     onImageRemove={handleImageRemove}
     initialValue={initialValue} 
     onSubmit= {handleOnSubmit}
     onBulletPointRemove={handleBulletPointRemove}
     />   
  );
};
