import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import { startDb } from "@/app/lib/db"
import { NewCartRequest } from "@/app/types"
import prisma from "@/prisma"

export const POST = async (req: Request) => {
    try {
        const session = await getServerSession(authOptions)
        const user = session?.user

        if(!user) return NextResponse.json({error: "User not authenticated!"}, {status: 401})

        const {productId, quantity} = await req.json() as NewCartRequest
        if(!productId || !isNaN(quantity)) 
        return NextResponse.json({error: "Invalid request, product id or quantity missing!"}, {status: 401})
       
        await startDb()

        const cart = await prisma.cartDocumet.findUnique({
            where:{
                id: user.id
            },
            include: {
                cartItems: true
            }
        })
        if(!cart){
            // create new cart if there is no cart
            await prisma.cartDocumet.create({
                data:{
                    id: user.id,
                    userId: user.id,
                    cartItems: {
                        create: [{
                            productId,
                            quantity
                        }]
                    }
                }
            })
            return NextResponse.json({message: "Product added to cart!"})
        }     
        
        // update quantity if it already exists

        const existingItem = cart.cartItems.find((item) => item.productId === productId);

        if (existingItem) {
            // update quantity if item already exists
            existingItem.quantity += quantity;
            if (existingItem.quantity <= 0) {
                // Remove item (product) if quantity becomes zero
                await prisma.cartItem.delete({
                    where: {
                        id: existingItem.id
                    }
                });
            } else {
                // Update the existing item with the new quantity
                await prisma.cartItem.update({
                    where: {
                        id: existingItem.id
                    },
                    data: {
                        quantity: existingItem.quantity
                    }
                });
            }
        } else {
            // add new item if it doesn't exist
            await prisma.cartItem.create({
                data: {
                    quantity,
                    product: {
                        connect: {
                            id: productId
                        }
                    },
                    cartDocumet: {
                        connect: {
                            id: cart.id
                        }
                    }
                }
            });
        }
        
        return NextResponse.json({ success: true });