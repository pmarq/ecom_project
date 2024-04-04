import { Prisma } from "@prisma/client";
import { DefaultArgs, JsonValue } from "@prisma/client/runtime/library";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { startDb } from "./db";
import prisma from "@/prisma";
import { Product } from "../components/CartItems";


type TArrPromises = Prisma.Prisma__ProductClient<TItemProd, null, DefaultArgs>;

type TItemProd = {
  id: string;
  title: string;
  price: JsonValue;
  thumbnails: {
    id: string;
    url: string;
    publicId: string;
    productId: string;
  }[];
} | null;

export const getCartItems = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }
  await startDb();

  const cartItems = await prisma.cartDocument.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      cartItems: true,
    },
  });
  const arrItems = cartItems?.cartItems;
  

  let arrProdsPromises: TArrPromises[] = [];
  arrItems?.map(async (item) => {
    const prodId = item.productId;
    const prodsInfo = prisma.product.findUnique({
      where: { id: prodId },
      select: {
        id: true,
        price: true,
        thumbnails: true,
        title: true,
      },
    });
    arrProdsPromises.push(prodsInfo);
  });

  const arrProds = await Promise.all(arrProdsPromises); 

  let arrObjs: Product[] = [];

  cartItems?.cartItems.map((itemCart) => {
    const prodIdCart = itemCart.productId;
    arrProds.map((itemProd: TItemProd) => {
      const prodIdProds = itemProd?.id;
      const condicional = prodIdCart == prodIdProds;
      if (condicional) {
        const newObj = { ...itemCart, ...itemProd };
        arrObjs.push(newObj);
      }
    });
  });
  return arrObjs;  
};