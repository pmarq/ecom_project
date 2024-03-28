import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { startDb } from "./db";
import prisma from "@/prisma";

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
  
    let arrProdsPromises: any = [];
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
  
    let arrObjs: any = [];
  
    cartItems?.cartItems.map((itemCart) => {
      const prodIdCart = itemCart.productId;
      arrProds.map((itemProd: any) => {
        const prodIdProds = itemProd.id;
        const condicional = prodIdCart == prodIdProds;
        if (condicional) {
          const newObj = { ...itemCart, ...itemProd };
          arrObjs.push(newObj);
        }
      });
    });
  
    return arrObjs;
  };

 async function Cart() {
 let cart = await getCartItems();

  let totalQty = 0;
  let cartTotal = 0;

  cart.map((item: any) => {
    totalQty = totalQty + item.quantity;    
    cartTotal = cartTotal + (item.price.discounted*item.quantity);
  });

  if (totalQty === 0) {
    return cart = null     
  }  
 }


  
  /* export default async function Cart() {
    const cart = await getCartItems();
  
    if (!cart) return (
     <div className="py-4">
      <div className="mb-4">
          <h1 className="text-2xl font-semibold">Your Cart Details</h1>
          <hr/>
       </div>   
          <h1 className="text-center font-semibold text-2xl opacity-40 py-10">Your cart is empty</h1> 
      </div>
  )
  
    let totalQty = 0;
    let cartTotal = 0;
  
    cart.map((item: any) => {
      totalQty = totalQty + item.quantity;    
      cartTotal = cartTotal + (item.price.discounted*item.quantity);
    });
    
  
    if (totalQty === 0) {
      return (
        <div className="py-4">
          <div className="mb-4">
              <h1 className="text-2xl font-semibold">Your Cart Details</h1>
              <hr/>
           </div>   
              <h1 className="text-center font-semibold text-2xl opacity-40 py-10">Your cart is empty</h1> 
          </div>
      )
    }
  
    console.log({ totalQty, cartTotal });
    return (
      <div>
        <CartItems
          products={cart}
          cartTotal={cartTotal}
          totalQty={totalQty}
          cartId={cart.id}
        />
      </div>
    );
  } */