import GridView from "@/app/components/GridView";
import dynamic from "next/dynamic";
import { startDb } from "@/app/lib/db";
import formatPrice from "@/app/utils/helpers/formatPrice";
import prisma from "@/prisma";
import dateFormat from "dateformat";
import React from "react";

const SalesChart = dynamic(() => import("@/app/components/SalesChart"), {
  ssr: false,
});

interface SalesHistory {
  [date: string]: {
    date: string;
    totalAmount: number;
  };
}

const fifteenDaysSalesHistory = async () => {
  // calculate the date: 15 days ago
  const fifteenDaysAgo = new Date();
  fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

  console.log("Fifteen Days Ago:", fifteenDaysAgo);

  const dateList: string[] = [];

  for (let i = 0; i < 15; i++) {
    const date = new Date(fifteenDaysAgo);
    date.setDate(date.getDate() + i);
    const dateString = date.toISOString().split("T")[0];
    dateList.push(dateString);
  }

  console.log(dateList);

  // fetch data from within those 15 days

  startDb();

  const lastFifteenDays = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: fifteenDaysAgo,
      },
      paymentStatus: "paid",
    },
    select: {
      createdAt: true,
      totalAmount: true,
    },
  });

  console.log(lastFifteenDays);

  // Group and aggregate the data
  const salesHistory = lastFifteenDays.reduce((acc: SalesHistory, order) => {
    const date = new Date(order.createdAt).toISOString().split("T")[0]; // Format date to YYYY-MM-DD
    if (!acc[date]) {
      acc[date] = { date, totalAmount: 0 };
    }
    acc[date].totalAmount += order.totalAmount;
    return acc;
  }, {} as SalesHistory);

  console.log(salesHistory);

  // Compare the date and fill empty sales with 0
  const sales = dateList.map((date) => {
    const matchedSale = salesHistory[date];
    return {
      day: dateFormat(date, "ddd"),
      sale: matchedSale ? matchedSale.totalAmount : 0,
    };
  });

  const totalSales = lastFifteenDays.reduce((prevValue, { totalAmount }) => {
    return (prevValue += totalAmount);
  }, 0);
  console.log(sales, totalSales);
  return { sales, totalSales };
};

// [{sale: number, day: string}] => [{sale: 1000, day: "mon"}], {sale: 0, day: "thu"}, ...]

export default async function Sales() {
  const salesData = await fifteenDaysSalesHistory();

  console.log("SALESDATA===>", salesData);

  return (
    <div>
      <GridView>
        <div className="bg-blue-500 p-4 rounded space-y-4">
          <h1 className="font-semibold text-3xl text-white">
            {formatPrice(salesData.totalSales)}
          </h1>

          <div className="text-white">
            <p>Total Sales</p>
            <p>Last 15 Days</p>
          </div>
        </div>
      </GridView>
      <div className="mt-10">
        <h1 className="font-semibold text-3xl mb-4">
          Last 15 days sales history
        </h1>
        <SalesChart data={salesData.sales} />
      </div>
    </div>
  );
}
