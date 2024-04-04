import { getServerSession } from "next-auth";
import Stripe from "stripe"
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { getCartItems } from "@/app/lib/cartHelper";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2023-10-16",
})

export const POST = async (req: Request) => {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({error: "Unauthorized request!"}, {status: 401});
        }

        const data = await req.json()
        const cartId = data.cartId as string

        if (!cartId) {
            return NextResponse.json({error: "Invalid cart id!"}, {status: 401});
        }

        // fetching cart details
       const cartItems = await getCartItems()

       if(session.user.id !== cartId) {
        return NextResponse.json({error: "Invalid cart id!"}, {status: 401});
       }
       if(!cartItems) {
        return NextResponse.json({error: "Invalid cart id!"}, {status: 404});
       }           
           

        // we need to generate payment link and send to front end.
        const params: Stripe.Checkout.SessionCreateParams = {
            mode: "payment",
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd", 
                        unit_amount: PRICE OF OUR PRODUCT,
                        product_data: {
                            name:,
                            images: []

                        },
                       
                    },
                    quantity: 1,

                }
            ]

        }

        await stripe.checkout.sessions.create({
             
        })

    } catch (error) {
        
    }
}