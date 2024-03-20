import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import CartItems from '@/app/components/CartItems'
import { startDb } from '@/app/lib/db'
import prisma from '@/prisma'
import { getServerSession } from 'next-auth'
import React from 'react'

const fetchCartProducts = async () => {
    const session = await getServerSession(authOptions)
    if(!session?.user) {return null}
    await startDb();    
    const cartItems = await prisma.cartDocument.findUnique({
        where: {
            id: session.user.id
        },
        include: {
            cartItems: true
        }
    })
    console.log("CartItems ====>>>",cartItems)

}

export default function Cart() {
    const cart = fetchCartProducts()
    if (!cart) return <div>not found</div>
  return (
    <div>
        <CartItems products={[]} cartTotal={0} totalQty={0} cartId={''} />
    </div>
  )
}
