import { resolveTypeJsonValues } from "@/app/utils/helpers/resolveTypeJsonValues";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { authOptions } from "../../auth/[...nextauth]/route";

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

    const { product } = await req.json();
    if (!product) {
      return NextResponse.json(
        { error: "Product information is required!" },
        { status: 400 }
      );
    }
    const { id, title, price, quantity = 1, thumbnail } = product;
    if (!id) {
      return NextResponse.json(
        { error: "Invalid product id!" },
        { status: 404 }
      );
    }

    const newPrice = resolveTypeJsonValues(price);
    const discounted = newPrice.discounted ?? 0;
    const images = thumbnail ?? "";

    const line_item = {
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

    const customer = await stripe.customers.create({
      metadata: {
        userId: session.user.id,
        type: "instant-checkout",
        product: JSON.stringify({
          id: product.id,
          title: product.title,
          price: product.discounted,
          thumbnails: product.thumbnails,
          totalPrice: product.discounted,
          qty: 1,
        }),
      },
    });

    // Generate payment link and send to front end.
    const params: Stripe.Checkout.SessionCreateParams = {
      line_items: [line_item],
      mode: "payment",
      payment_method_types: ["card"],
      success_url: process.env.PAYMENT_SUCCESS_URL!,
      cancel_url: process.env.PAYMENT_CANCEL_URL!,
      shipping_address_collection: { allowed_countries: ["BR"] },
      customer: customer.id,
    };
    const checkoutSession = await stripe.checkout.sessions.create(params);

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.log({ error });
    return NextResponse.json(
      { error: "Something went wrong!" },
      { status: 500 }
    );
  }
};
