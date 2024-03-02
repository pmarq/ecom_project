import FeaturedProductForm from '@/app/components/FeaturedProductForm';
import { startDb } from '@/app/lib/db';
import prisma from '@/prisma';
import { redirect } from 'next/navigation';
import React from 'react'

interface Props {
    searchParams: { id: string }
}

const fetchFeaturedProduct = async (id: string) => {
    if(!id) redirect("/404");
    await startDb();
    const featuredProduct = await prisma.featuredProduct.findUnique({
        where: {
            id: id,
        }
    })
    if(!featuredProduct) redirect("/404");
    
    return {
        id: featuredProduct.id,
        link: featuredProduct.link,
        linkTitle: featuredProduct.linkTitle,
        title: featuredProduct.title,
        banner: featuredProduct.url,        
}
}

export default async function UpdateFeaturedProduct({searchParams}: Props) {
    const {id} = searchParams;
    const featuredProduct = await fetchFeaturedProduct(id);
  return (
    <FeaturedProductForm initialValue={featuredProduct} />
  )
}
