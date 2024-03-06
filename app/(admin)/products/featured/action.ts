"use server"

import { startDb } from "@/app/lib/db";
import { FeaturedProductForUpdate, NewFeaturedProduct } from "@/app/types";
import prisma from "@/prisma";
import { removeImageFromCloud } from "../action";


export const createFeaturedProduct = async (info: NewFeaturedProduct) => {
    console.log({ info });
    try {
      await startDb();
      const defaultValues = {
        url: info.banner.url,
        publicId: info.banner.publicId,
        link: info.link,
        linkTitle: info.linkTitle,
        title: info.title,
      };
      const featuredProduct = await prisma.featuredProduct.create({
        data: {
          ...defaultValues,
        },
      });
      console.log({ featuredProduct });
    } catch (error) {
      console.error(error);
    }
  };

  export const updateFeaturedProduct = async (id: string, dataToUpdate: FeaturedProductForUpdate) => {
    console.log("DataToUpdate ======>>>>>",{ dataToUpdate });
    try {
      await startDb();
      const featuredProductUpd = {        
        link: dataToUpdate.link,
        linkTitle: dataToUpdate.linkTitle,
        title: dataToUpdate.title,
        url: dataToUpdate.banner?.url,
        publicId: dataToUpdate.banner?.publicId
      };   
      const featuredProductForUpdate = await prisma.featuredProduct.update({
        where: {
          id: id,
        },
        data: {
          ...featuredProductUpd,
        }
      });     
    
    } catch (error) {
      console.error(error);
    }
  };

  export const deleteFeaturedProduct = async (id: string) => {
    try {
      await startDb();
      const featuredProduct = await prisma.featuredProduct.findUnique({
        where: {
          id: id,
        }
      })
      if(featuredProduct){
        removeImageFromCloud(featuredProduct.publicId);
      }      
      const featuredProductToDelete = await prisma.featuredProduct.delete({
        where: {
          id: id,
        }
      })
    } catch (error) {
      console.error(error);
    }
      
  }

  export const fetchFeaturedProduct = async () => {
    try {
      await startDb();
      const featuredProducts = await prisma.featuredProduct.findMany({
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          url: true,
          publicId: true,
          link: true,
          linkTitle: true,
          title: true,
          createdAt: true
        }
    });
      return featuredProducts.map((featuredProduct) => {
        return {
          id: featuredProduct.id.toString(),
          link: featuredProduct.link,
          linkTitle: featuredProduct.linkTitle,
          title: featuredProduct.title,
          banner: featuredProduct.url,
         }
      });
    } catch (error) {
      console.error(error);
    }
  }

