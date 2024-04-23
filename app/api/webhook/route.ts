import { getCartItems } from "@/app/lib/cartHelper";
import { StripeCustomer } from "@/app/types";
import prisma from "@/prisma";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecret = process.env.STRIPE_SECRET_KEY!
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!


const stripe = new Stripe(stripeSecret, {
    apiVersion: "2023-10-16",
  });

  export const POST = async (req: Request) => {

    const data = await req.text();
  
    const signature = req.headers.get("stripe-signature")!;   

    let event

    try {
      event = await stripe.webhooks.constructEvent(data, signature, webhookSecret);

    } catch (error) {
        console.error("Error===>",error)
        return NextResponse.json({ error:(error as any).message }, { status: 400 });
        
    } 

    console.log("Event===>",event.type)

    if(event.type === "checkout.session.completed") {
        const stripeSession = event.data.object as {
            customer: string;
            payment_intent: string;
            amount_subtotal: number;   
            customer_details: any;
            payment_status: string;
          }

        const customer = await stripe.customers.retrieve(stripeSession.customer!) as 
        unknown as StripeCustomer

        const { userId, cartId, type } = customer.metadata
        // create new order
        if(type === "checkout") {
           const cartItems = await getCartItems() 
           prisma.order.create(
            {
                data: {
                    userId,
                    stripeCustomerId: stripeSession.customer,
                    paymentIntent: stripeSession.payment_intent,
                    shippingDetails: {
                        address: stripeSession.customer_details.address,
                        name: stripeSession.customer_details.name,
                        email: stripeSession.customer_details.email         
                    },
                    paymentStatus: stripeSession.payment_status,
                    deliveryStatus: "ORDERED",
                    orderItems: cartItems?.arrObjs                                 
                }
            }
           )
        }

        // recount our stock
    }

    return NextResponse.json({ received: true }, { status: 200 });
}