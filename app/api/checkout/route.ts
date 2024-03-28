import { getServerSession } from "next-auth";
import Stripe from "stripe"
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2023-10-16",
})

export const POST = async (req: Request) => {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({error: "Unauthorized request!"}, {status: 401});
        }

        const data = await req.json()
        const cartId = data.cartId as string

        if (!cartId) {
            return NextResponse.json({error: "Invalid cart id!"}, {status: 401});
        }


        // we need to generate payment link and send to front end.

    } catch (error) {
        
    }
}