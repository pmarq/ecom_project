import { getCartItems } from "@/app/lib/cartHelper";
import { CartProduct, StripeCustomer } from "@/app/types";
import { resolveTypeJsonValues } from "@/app/utils/helpers/resolveTypeJsonValues";
import prisma from "@/prisma";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecret = process.env.STRIPE_SECRET_KEY!;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const stripe = new Stripe(stripeSecret, {
  apiVersion: "2023-10-16",
});

interface OrderItem {
  id?: string;
  orderId: string;
  title: string;
  thumbnail: string;
  totalPrice: number;
  price: number;
  qty: number;
}

interface StockQuantity {
  productId: string;
  quantity: number;
}

async function createOrderItem(item: OrderItem) {
  await prisma.orderItem.create({
    data: {
      ...item,
    },
  });
}

async function getCurrentStock(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { quantity: true },
  });
  return product?.quantity || 0;
}

console.log();

/// getThumbnail function /////

async function getThumbnail(productId: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { thumbnails: true },
    });
    return product?.thumbnails ? product.thumbnails[0]?.url : "";
  } catch (error) {
    console.error("Error fetching thumbnail:", error);
    return "";
  }
}

//////

async function updateStock(productId: string, newStock: number) {
  await prisma.product.update({
    where: { id: productId },
    data: { quantity: newStock },
  });
}

async function recountStock(orderCartItems: StockQuantity[]) {
  for (const item of orderCartItems) {
    const { productId, quantity } = item;
    if (!productId || quantity == null) {
      console.error("Invalid product data:", item);
      continue;
    }
    const currentStock = await getCurrentStock(productId);
    const newStock = currentStock - quantity;

    await updateStock(productId, newStock);

    if (newStock <= 5) {
      console.log(
        `Low stock alert for product ID: ${productId}. Current stock: ${newStock}`
      );
    }
  }
}

async function deleteCartItems(userId: string) {
  try {
    const result = await prisma.cartItem.deleteMany({
      where: {
        cartDocumentId: userId,
      },
    });
    console.log(
      `Deleted ${result.count} cart items for document ID: ${userId}`
    );
  } catch (error) {
    console.error("Failed to delete cart items:", error);
  }
}

async function deleteEmptyCartDocument(userId: string) {
  const document = await prisma.cartDocument.findUnique({
    where: { id: userId },
  });

  if (!document) {
    console.log(`No cart document found with ID: ${userId}, cannot delete.`);
    return;
  }

  const items = await prisma.cartItem.count({
    where: { cartDocumentId: userId },
  });

  if (items === 0) {
    await prisma.cartDocument.delete({
      where: { id: userId },
    });
    console.log(
      `Cart document with ID: ${userId} has been successfully deleted.`
    );
  } else {
    console.log(
      `Cart document with ID: ${userId} is not empty, cannot delete.`
    );
  }
}

export const POST = async (req: Request) => {
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

    const customer = (await stripe.customers.retrieve(
      stripeSession.customer!
    )) as unknown as StripeCustomer;

    const { type, product } = customer.metadata;

    // create new order

    if (type === "checkout") {
      const userId = customer.metadata.userId;

      const cartItems = await getCartItems(userId);

      if (!cartItems || !cartItems.arrObjs) {
        console.error("No cart items found for user:");
        return;
      }

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
        const totalPrice = (discounted * quantity) / 100;
        const orderId = order.id;
        const newTitle = title ? title : "";

        const obj = {
          title: newTitle,
          thumbnail,
          qty: quantity,
          price: discounted,
          totalPrice,
          orderId,
        };

        // Ensure each order item creation is awaited

        try {
          await createOrderItem(obj);
          console.log("Order item created successfully for:", title);
        } catch (error) {
          console.error("Failed to create order item for:", title, error);
        }

        return {
          productId: product.productId,
          quantity: product.quantity,
        };
      });

      const itemsProcessed = await Promise.all(orderCartItems);

      // ---- Recount Stock ----
      await recountStock(itemsProcessed);
      console.log("All order items have been created and stock recounted.");

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
      // remove cart items
      await deleteCartItems(userId);
      await deleteEmptyCartDocument(userId);
    }

    if (type === "instant-checkout") {
      const userId = customer.metadata.userId;

      let productInfo: any;
      try {
        productInfo = JSON.parse(product);
      } catch (error) {
        console.error("Error parsing product info:", error);
        return NextResponse.json(
          { error: "Invalid product data" },
          { status: 400 }
        );
      }

      if (!productInfo) {
        console.error("No product found for user:");
        return;
      }

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

      const orderCartItem = async () => {
        const { qty, title } = productInfo;
        const thumbnail = await getThumbnail(productInfo.id);

        /// função para pegar o thumbnail 27/05 utilizando prisma

        let newPrice = Number(stripeSession.amount_subtotal) / 100;

        const discounted = newPrice ?? 0;
        const thumbnails = thumbnail ?? "";
        const totalPrice = discounted * qty;
        const orderId = order.id;
        const newTitle = title ? title : "";

        const obj = {
          title: newTitle,
          thumbnail: thumbnails,
          qty: qty,
          price: discounted,
          totalPrice,
          orderId,
        };

        // Ensure each order item creation is awaited

        try {
          await createOrderItem(obj);
          console.log("Order item created successfully for:", title);
        } catch (error) {
          console.error("Failed to create order item for:", title, error);
          return null;
        }
        return {
          productId: productInfo.id,
          quantity: productInfo.qty,
        };
      };

      const itemsProcessed = await orderCartItem();

      if (!itemsProcessed) {
        return NextResponse.json(
          { error: "Failed to process order item" },
          { status: 500 }
        );
      }

      // ---- Recount Stock ----

      try {
        const currentProduct = await prisma.product.findUnique({
          where: { id: productInfo.id },
        });

        if (currentProduct) {
          const newStock = currentProduct.quantity - itemsProcessed.quantity;

          await prisma.product.update({
            where: { id: productInfo.id },
            data: { quantity: newStock },
          });
          console.log(
            `Stock updated for product ID: ${itemsProcessed.productId}`
          );
        } else {
          console.error("Product not found for stock update");
        }
      } catch (error) {
        console.error(
          "Failed to update stock for product ID:",
          itemsProcessed.productId,
          error
        );
      }

      // ---- Create Shipping Details ----

      try {
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
        console.log(`Shipping details created for order ID: ${order.id}`);
      } catch (error) {
        console.error(
          "Failed to create shipping details for order ID:",
          order.id,
          error
        );
      }
    }
  }
  return NextResponse.json({ received: true }, { status: 200 });
};
