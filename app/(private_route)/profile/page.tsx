import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import EmailVerificationBanner from "@/app/components/EmailVerificationBanner";
import OrderListPublic, { Orders } from "@/app/components/OrderListPublic";
import ProfileForm from "@/app/components/ProfileForm";
import { startDb } from "@/app/lib/db";
import prisma from "@/prisma";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

const fetchLatestOrder = async (): Promise<string | null> => {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return redirect("/auth/signin");
  }
  await startDb();
  const userId = session.user.id;
  const orders = await prisma.order.findMany({
    where: {
      userId,
    },
    include: {
      orderItems: true,
    },
    orderBy: {
      createdAt: "desc", // Sort by creation date in descending order
    },
    take: 1, // Take only the latest order
  });

  if (orders.length === 0) {
    return null;
  }

  const latestOrder = orders[0];

  const result: Orders = {
    id: latestOrder.id.toString(),
    products: latestOrder.orderItems, // Corrected from 'product' to 'products'
    paymentStatus: latestOrder.paymentStatus,
    date: latestOrder.createdAt.toISOString(), // Convert Date object to string
    total: latestOrder.totalAmount,
    deliveryStatus: latestOrder.deliveryStatus.toLocaleLowerCase() as
      | "ordered"
      | "shipped"
      | "delivered",
  };

  return JSON.stringify(result);
};

const fetchUserProfile = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user) return redirect("/auth/signin");

  await startDb();

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });
  if (!user) return redirect("/auth/signin");
  return {
    id: user.id.toString(),
    name: user.name ?? "",
    email: user.email ?? "",
    image: user.image ?? "",
    emailVerified: user.emailVerified,
  };
};

export default async function Profile() {
  const profile = await fetchUserProfile();
  const orderString = await fetchLatestOrder();

  let order: Orders | null = null;
  if (orderString) {
    order = JSON.parse(orderString);
  }

  return (
    <div>
      <EmailVerificationBanner
        id={profile.id}
        emailVerified={profile.emailVerified}
      />
      <div className="flex py-4 space-y-4">
        <div className="border-r border-gray-700 p-4 space-y-4">
          <ProfileForm
            avatar={profile.image}
            name={profile.name}
            email={profile.email}
            id={profile.id}
          />
        </div>
        <div className="p-4 flex-1">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold uppercase opacity-70 mb-4">
              Your recent orders
            </h1>
            <Link href="/profile/orders" className="uppercase hover:underline">
              See all orders
            </Link>
          </div>
          {order ? (
            <OrderListPublic orders={[order]} />
          ) : (
            <div>No recent orders found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
