import { getCartItems } from "@/app/lib/cartHelper";
import { StripeCustomer } from "@/app/types";
import { resolveTypeJsonValues } from "@/app/utils/helpers/resolveTypeJsonValues";
import prisma from "@/prisma";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecret = process.env.STRIPE_SECRET_KEY!;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const stripe = new Stripe(stripeSecret, {
  apiVersion: "2023-10-16",
});

async function createOrderItem(item: any) {
  await prisma.orderItem.create({
    data: {
      ...item,
    },
  });
}

export const POST = async (req: Request) => {
  console.log("Start Webhook====>", req);
  const data = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event;

  try {
    event = await stripe.webhooks.constructEvent(
      data,
      signature,
      webhookSecret
    );
    if (!event) {
      return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error===>", error);
    return NextResponse.json(
      { error: (error as any).message },
      { status: 400 }
    );
  }

  console.log("EventAQUI===>", event.type);
  /* 
  const session = await getServerSession(authOptions);
  console.log("SESSION====>", session); */

  if (event.type === "checkout.session.completed") {
    const stripeSession = event.data.object as {
      customer: string;
      payment_intent: string;
      amount_subtotal: number;
      payment_status: string;
      customer_details: {
        email: string;
        name: string;
        address: {
          city: string;
          country: string;
          line1: string;
          line2?: string;
          postal_code: string;
          state: string;
        };
      };
    };

    console.log("EVENT=====>", event);

    const customer = (await stripe.customers.retrieve(
      stripeSession.customer!
    )) as unknown as StripeCustomer;

    const { userId, cartId, type } = customer.metadata;

    // create new order

    if (type === "checkout") {
      console.log("CHECOUT===>", "checkout");

      const userId = customer.metadata.userId;

      const cartItems = await getCartItems(userId); // essa função eu passo mas ela não está pegando o cartItems

      if (!cartItems || !cartItems.arrObjs) {
        console.error("No cart items found for user:");
        return;
      }

      console.log("CARTITEMS=====>", cartItems); // resultado do console log é null

      console.log("STRIPESESS=====>", stripeSession);

      const order = await prisma.order.create({
        data: {
          userId,
          stripeCustomerId: stripeSession.customer,
          paymentIntent: stripeSession.payment_intent,
          paymentStatus: stripeSession.payment_status,
          deliveryStatus: "ORDERED",
          totalAmount: stripeSession.amount_subtotal,
        },
      });

      const orderCartItems = cartItems?.arrObjs.map(async (product) => {
        const { quantity, price, title, thumbnails } = product;
        const newPrice = resolveTypeJsonValues(price);
        const discounted = newPrice.discounted ?? 0;
        const thumbnail = thumbnails ? thumbnails[0]?.url : "";
        const totalPrice = discounted * quantity;
        const orderId = order.id;

        const obj = {
          title,
          thumbnail,
          qty: quantity,
          price: discounted,
          totalPrice,
          orderId,
        };

        console.log("Order Item Details:", obj);

        // Ensure each order item creation is awaited
        try {
          await createOrderItem(obj);
          console.log("Order item created successfully for:", title);
        } catch (error) {
          console.error("Failed to create order item for:", title, error);
        }
      });

      await Promise.all(orderCartItems);
      console.log("All order items have been created.");

      // ---- Create Shipping Details ----

      await prisma.shippingDetails.create({
        data: {
          orderId: order.id,
          email: stripeSession.customer_details.email,
          name: stripeSession.customer_details.name,
          address: {
            create: {
              city: stripeSession.customer_details.address.city,
              country: stripeSession.customer_details.address.country,
              line1: stripeSession.customer_details.address.line1,
              line2: stripeSession.customer_details.address.line2,
              postalCode: stripeSession.customer_details.address.postal_code,
              state: stripeSession.customer_details.address.state,
            },
          },
        },
      });
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
};
