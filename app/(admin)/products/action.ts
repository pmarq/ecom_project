"use server";

import { startDb } from "@/app/lib/db";
import {
  BulletPoints,
  ProductDataToUpdate,
  ProductResponse,
  image,
  info,
} from "@/app/types";
import prisma from "@/prisma";
import { v2 as cloudinary } from "cloudinary";
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb"; // Import para validação de ObjectId

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
  secure: true,
});

export const getCloudConfig = async () => {
  return {
    name: process.env.CLOUD_NAME!,
    key: process.env.CLOUD_API_KEY!,
  };
};

// Generate cloud signature
export const getCloudSigature = async () => {
  const secret = cloudinary.config().api_secret as string;
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
    },
    secret
  );

  return { timestamp, signature };
};

/////////// CREATE PRODUCT

export const createProduct = async (info: info) => {
  const userId = info.userId;

  const sale = (info.mrp - info.salePrice) / info.mrp;

  const defaultValues = {
    title: info.title,
    description: info.description,
    price: {
      base: info.mrp,
      discounted: info.salePrice,
    },
    sale,
    category: info.category,
    quantity: info.quantity,
  };

  const product = await prisma.product.create({
    data: {
      ...defaultValues,
      user: { connect: { id: userId } },
    },
  });

  const productId = product.id;

  // Create bullet points
  const bulletPromises = info.bulletPoints.map((item: BulletPoints) =>
    createBullet(item.content, productId)
  );
  await Promise.all(bulletPromises); // Aguarda todas as promessas

  async function createBullet(str: string, productId: string) {
    await prisma.bulletPoint.create({
      data: {
        content: str,
        product: { connect: { id: productId } },
      },
    });
  }

  // Create images
  const imgPromises = info.images.map((item: image) =>
    createImg(item, productId)
  );
  await Promise.all(imgPromises); // Aguarda todas as promessas

  const createImg = async (obj: image, productId: string) => {
    await prisma.image.create({
      data: {
        publicId: obj.publicId,
        url: obj.url,
        product: { connect: { id: productId } },
      },
    });
  };

  // Create thumbnail
  await prisma.thumbnail.create({
    data: {
      publicId: info.thumbnail.publicId,
      url: info.thumbnail.url,
      product: { connect: { id: productId } },
    },
  });
};

export const fetchProducts = async (
  userId: string | undefined,
  pageNo: number,
  perPage: number
) => {
  const skipCount = (pageNo - 1) * perPage;
  await startDb();
  const allProds = await prisma.product.findMany({
    where: {
      userId: userId,
      price: { not: null as any }, //solução chat gpt**
    },
    orderBy: {
      createdAt: "desc",
    },

    select: {
      thumbnails: true,
      price: true,
      quantity: true,
      category: true,
      title: true,
      id: true,
      createdAt: true,
    },
    skip: skipCount, // Skip the appropriate number of products based on page number
    take: perPage, // Retrieve 'perPage' number of products
  });
  return allProds;
};

export const removeImageFromCloud = async (publicId: string) => {
  await cloudinary.uploader.destroy(publicId);
};

///// FETCH PRODUCT INFO

export const fetchProductInfo = async (productId: string): Promise<string> => {
  await startDb();

  if (!ObjectId.isValid(productId)) {
    throw new Error("Invalid Product ID format");
  }

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    select: {
      id: true,
      title: true,
      quantity: true,
      price: true,
      description: true,
      category: true,
      bulletPoints: true,
      thumbnails: true,
      images: true,
    },
  });

  if (!product) return redirect("/404");

  const prod = product?.price;
  const str = JSON.stringify(prod);
  const obj = JSON.parse(str);

  const finalProduct: ProductResponse = {
    id: product.id.toString(),
    title: product.title,
    description: product.description,
    quantity: product.quantity,
    price: {
      base: obj.base,
      discounted: obj.discounted,
    },
    bulletPoints: product.bulletPoints,
    images: product.images.map(({ url, id, publicId }) => {
      return { url, id, publicId };
    }),
    thumbnail: product.thumbnails,
    category: product.category,
    userId: "",
    mrp: 0,
    salePrice: 0,
  };

  return JSON.stringify(finalProduct);
};

// Remove image from cloud and from MongoDB
export const removeAndUpdateProductImage = async (
  productId: string,
  imageId: string,
  imageIdMongo: string
) => {
  const { result } = await cloudinary.uploader.destroy(imageId);
  if (result === "ok") {
    try {
      await startDb();
      await prisma.image.delete({
        where: {
          id: imageIdMongo,
        },
      });
    } catch (error) {
      console.error("Error removing/updating product image:", error);
    }
  }
};

//// REMOVE BULLETPOINT FROM DB

export const deleteBulletPoint = async (bulletPointToRemove: {
  content: string;
  id: string;
  productId: string;
}) => {
  try {
    await startDb();

    const bulletPoint = await prisma.bulletPoint.findUnique({
      where: { id: bulletPointToRemove.id },
    });

    if (bulletPoint) {
      await prisma.bulletPoint.delete({
        where: { id: bulletPointToRemove.id },
      });
    } else {
      console.error("Bullet point not found.");
    }
  } catch (error) {
    console.error(error);
  }
};

///////////////////// UPDATE PRODUCT

export const updateProduct = async (
  productId: string,
  dataToUpdate: ProductDataToUpdate
) => {
  const prodsUpdt = {
    title: dataToUpdate.title,
    description: dataToUpdate.description,
    category: dataToUpdate.category,
    quantity: dataToUpdate.quantity,
    price: dataToUpdate.price,
  };

  await prisma.product.update({
    where: { id: productId },
    data: { ...prodsUpdt },
  });

  if (dataToUpdate.thumbnail) {
    await prisma.thumbnail.update({
      where: { id: dataToUpdate.thumbnailId },
      data: {
        ...dataToUpdate.thumbnail,
      },
    });
  }

  if (dataToUpdate.images) {
    const imagesUpdt = dataToUpdate.images.map(async (item: image) => {
      await prisma.image.create({
        data: {
          publicId: item.publicId,
          url: item.url,
          product: { connect: { id: productId } },
        },
      });
    });
    await Promise.all(imagesUpdt); // Aguarda todas as promessas de criação de imagem serem resolvidas
  }

  // Atualiza bullet points
  if (dataToUpdate.bulletPoints) {
    const bulletPointsUpdt = dataToUpdate.bulletPoints.map(
      async (item: BulletPoints) => {
        try {
          if (item.id) {
            await prisma.bulletPoint.update({
              where: { id: item.id },
              data: { content: item.content },
            });
          } else {
            await prisma.bulletPoint.create({
              data: {
                content: item.content,
                product: { connect: { id: productId } },
              },
            });
          }
        } catch (error) {
          console.error("Error updating bullet points:", error);
        }
      }
    );
    await Promise.all(bulletPointsUpdt); // Aguarda todas as promessas de atualização/criação de bullet points
  }
};
