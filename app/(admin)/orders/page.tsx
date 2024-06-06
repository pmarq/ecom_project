import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import OrderCard, { Order } from "@/app/components/OrderCart";

import { startDb } from "@/app/lib/db";
import prisma from "@/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import React from "react";

const fetchOrders = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }
  await startDb();
  const userId = session?.user?.id;
  const orders = await prisma.order.findMany({
    where: {
      userId,
    },
    include: {
      orderItems: true,
      user: true,
      shippingDetails: {
        include: {
          address: true,
        },
      },
    },
  });

  const result: Order[] = orders.map(
    (order): Order => ({
      id: order.id.toString(),
      customer: {
        id: order.user.id,
        name: order.user.name || "",
        email: order.user.email || "",
        avatar: order.user.image || "",
        address:
          order.shippingDetails.length > 0
            ? order.shippingDetails[0].address[0]
            : {},
      },
      subTotal: order.totalAmount,
      products: order.orderItems.map((item) => ({
        id: item.id,
        title: item.title,
        thumbnail: item.thumbnail,
        totalPrice: item.totalPrice,
        price: item.price,
        qty: item.qty,
      })),
      deliveryStatus: order.deliveryStatus.toLowerCase() as
        | "ordered"
        | "shipped"
        | "delivered",
    })
  );

  return JSON.stringify(result);
};

export default async function Orders() {
  const result = await fetchOrders();
  if (!result) {
    return redirect("/404");
  }
  const orders = JSON.parse(result) as Order[];

  return (
    <div className="py-4 space-y-4">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} disableUpdate={false} />
      ))}
    </div>
  );
}
