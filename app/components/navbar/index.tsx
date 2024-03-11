import React from 'react'
import NavUI from './NavUi'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { startDb } from '@/app/lib/db';
import prisma from '@/prisma';



const getCartItemsCount = async () => {
  try {
    const session = await getServerSession(authOptions) 
    if(!session?.user) return 0;

    const userId = session.user.id

    await startDb()
   const cart = await prisma.cartDocument.findMany({
    where: {
      userId: userId
    },
    select: {
      cartItems:{
        select: {
          quantity: true,
        }
      }
    }   
    
   })

   console.log("Cart ====>",cart)

   let totalQuantity = 0;
    cart.forEach(cartDocument => {
      cartDocument.cartItems.forEach(cartItem => {
        totalQuantity += cartItem.quantity;
      });
    });

    console.log("TotalQuantity ====>",totalQuantity)

    return totalQuantity;    
    
  } catch (error) {
    console.error("Error while fetching cart items count:",error);
    return 0    
  }
}

export default async function Navbar() {
  const cartItemsCount = await getCartItemsCount()
  return (
  <NavUI cartItemsCount={cartItemsCount} />
  )
}
