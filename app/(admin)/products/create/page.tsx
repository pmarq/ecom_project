"use client"

import ProductForm from '@/app/components/ProductForm'
import React from 'react'
import { uploadImage } from '@/app/utils/helper'
import { createProduct } from '../action'
import { NewProductInfo, image } from '@/app/types'
import { useRouter } from 'next/navigation'



     function uploadProductImages(images: File[]) {
      let uploadArrayPromise: Promise<image>[] = []
        images.map ((item: File) => {
        const createImg = uploadImage(item);
        uploadArrayPromise.push(createImg)        
      });
      const arrayProductImg = Promise.all(uploadArrayPromise)  
      return arrayProductImg;      
    }


    export default function Create() {
      const router = useRouter();
      let thumbnailObj: image;
      let imagesObj: image[];
    
      const handleCreateProduct = async (values: NewProductInfo) => {
        const {
          thumbnail,
          imagesFiles: images,
          userId,
          bulletPoints,
          category,
          description,
          mrp,
          quantity,
          salePrice,
          title,
        } = values;
    
        if (thumbnail) {
          const thumbnailRes = await uploadImage(thumbnail);
          thumbnailObj = thumbnailRes;
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
        router.refresh();
        router.push('/products/');

      };
    
      return (
        <div>
          <ProductForm onSubmit={handleCreateProduct} />
        </div>
      );
    }