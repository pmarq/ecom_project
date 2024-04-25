import { resolveTypeJsonValues } from "@/app/utils/helpers/resolveTypeJsonValues";
import { authOptions } from "../auth/[...nextauth]/route";
import { getCartItems } from "@/app/lib/cartHelper";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import Stripe from "stripe";



const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export const POST = async (req: Request) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized request!" },
        { status: 401 }
      );
    }  

    const cartItems = await getCartItems();  
    let totalQty = 0;
    let cartTotal = 0;

    cartItems?.arrObjs.map((item) => {
      const newPrice = resolveTypeJsonValues(item?.price);
      const discounted = newPrice.discounted ?? 0;

      totalQty = totalQty + item.quantity;
      cartTotal = cartTotal + discounted * item.quantity;
    });

   /*  if (session.user.id !== cartItems?.cartItems[0]?.id) {
       return NextResponse.json({ error: "Invalid cart id!" }, { status: 401 });
    } */  //***rever aqui 22/04***//

    if (!cartItems) {
      return NextResponse.json({ error: "Invalid cart id!" }, { status: 404 });
    }  

    const line_items = cartItems.arrObjs.map((product) => {
      const { quantity, price, title, thumbnails } = product;
      const newPrice = resolveTypeJsonValues(price);
      const discounted = newPrice.discounted ?? 0;
      const images = thumbnails ? thumbnails[0]?.url : "";

      return {
        price_data: {
          currency: "BRL",
          unit_amount: discounted * 100,
          product_data: {
            name: String(title),
            images: [images],
          },
        },
        quantity,
      };
    });

   const cartId = cartItems.cartItems?.cartItems[0]?.id ? cartItems.cartItems?.cartItems[0]?.id :"";

   const customer = await stripe.customers.create({
      metadata: {
        userId: session.user.id,
        cartId: cartId, 
        type: "checkout",
      }
    })
    
    // we need to generate payment link and send to front end.
    const params: Stripe.Checkout.SessionCreateParams = {
      line_items,
      mode: "payment",
      payment_method_types:['card'],
      success_url: process.env.PAYMENT_SUCCESS_URL,
      cancel_url: process.env.PAYMENT_CANCEL_URL,
      shipping_address_collection: {allowed_countries: ['BR']},
      customer: customer.id, //inclui o customer id no checkout**22/04
    };
    const checkoutSession = await stripe.checkout.sessions.create(params);

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
      console.log({ error });
    return NextResponse.json({ error: "Something went wrong!" }, { status: 500 });
  
  }
};