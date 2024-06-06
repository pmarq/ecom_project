import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import OrderListPublic, { Orders } from "@/app/components/OrderListPublic";
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
    },
  });

  const result: Orders[] = orders.map((order) => ({
    id: order.id.toString(),
    products: order.orderItems,
    paymentStatus: order.paymentStatus,
    date: order.createdAt.toISOString(), // Convert Date object to string
    total: order.totalAmount,
    deliveryStatus: order.deliveryStatus.toLocaleLowerCase() as
      | "ordered"
      | "shipped"
      | "delivered",
  }));

  return JSON.stringify(result);
};

export default async function Order() {
  const result = await fetchOrders();
  if (!result) {
    return redirect("/404");
  }
  return (
    <div>
      <OrderListPublic orders={JSON.parse(result)} />
    </div>
  );
}
