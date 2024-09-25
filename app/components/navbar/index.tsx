import React from "react";
import NavUI from "./NavUi";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { startDb } from "@/app/lib/db";
import prisma from "@/prisma";
import { redirect } from "next/navigation";
import { GetServerSidePropsContext } from "next";

const fetchUserProfile = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

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

const getCartItemsCount = async () => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return 0;

    const userId = session.user.id;

    await startDb();
    const cart = await prisma.cartDocument.findMany({
      where: {
        userId: userId,
      },
      select: {
        cartItems: {
          select: {
            quantity: true,
          },
        },
      },
    });

    let totalQuantity = 0;
    cart.forEach((cartDocument) => {
      cartDocument.cartItems.forEach((cartItem) => {
        totalQuantity += cartItem.quantity;
      });
    });

    return totalQuantity;
  } catch (error) {
    console.error("Error while fetching cart items count:", error);
    return 0;
  }
};

export default async function Navbar() {
  const cartItemsCount = await getCartItemsCount();
  const profile = await fetchUserProfile();

  return <NavUI cartItemsCount={cartItemsCount} avatar={profile?.image} />;
}

/* ------------------------------- */
/* 
interface Profile {
  id: string;
  name: string;
  email: string;
  image: string;
}

interface NavbarProps {
  cartItemsCount: number;
  profile: Profile;
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);

  console.log("Session:", session);

  if (!session?.user) {
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false,
      },
    };
  }

  await startDb();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false,
      },
    };
  }

  const cart = await prisma.cartDocument.findMany({
    where: {
      userId: session.user.id,
    },
    select: {
      cartItems: {
        select: {
          quantity: true,
        },
      },
    },
  });

  let totalQuantity = 0;
  cart.forEach((cartDocument) => {
    cartDocument.cartItems.forEach((cartItem) => {
      totalQuantity += cartItem.quantity;
    });
  });

  return {
    props: {
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
      cartItemsCount: totalQuantity,
    },
  };
}

export default function Navbar({ cartItemsCount, profile }: NavbarProps) {
  return <NavUI cartItemsCount={cartItemsCount} avatar={profile?.image} />;
}
 */
