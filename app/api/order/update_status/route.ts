import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { startDb } from "@/app/lib/db";
import { NextResponse } from "next/server";
import prisma from "@/prisma";
import { ObjectId } from "mongodb"; // Importação correta

const validStatus = ["ORDERED", "SHIPPED", "DELIVERED"];

export const POST = async (req: Request) => {
  const session = await getServerSession(authOptions);

  const user = session?.user;

  const test = await req.json();

  if (user?.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Unauthorized request!" },
      { status: 401 }
    );
  }

  const orderId = test.orderId;
  const deliveryStatus = test.deliveryStatus;

  await startDb();

  try {
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        shippingDetails: true,
        user: true,
        orderItems: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found!" }, { status: 404 });
    }

    // Verifica os IDs dos produtos antes de usá-los
    for (const item of order.orderItems) {
      if (!isValidObjectId(item.id)) {
        console.error(`Invalid ObjectId: ${item.id}`);
        continue;
      }
    }

    const deliveryStatusUpperCase = deliveryStatus.toUpperCase();

    // Atualiza o status de entrega do pedido
    const updatedOrder = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        deliveryStatus: deliveryStatusUpperCase,
      },
    });

    return NextResponse.json(
      { success: true, order: updatedOrder },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product details" },
      { status: 500 }
    );
  }
};

// Função utilitária para validar ObjectId
function isValidObjectId(id: string) {
  return ObjectId.isValid(id);
}
