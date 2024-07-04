"use client";

import React from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import formatPrice from "../utils/helpers/formatPrice";

interface Props {
  data: {
    day: string;
    sale: number;
  }[];
}

const SalesChart: React.FC<Props> = ({ data = [] }) => {
  console.log("DATA===>", data);
  return (
    <LineChart
      margin={{ left: 60, top: 20 }}
      width={800}
      height={400}
      data={data}
    >
      <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
      <XAxis dataKey="day" />
      <YAxis tickFormatter={(value) => formatPrice(value)} />
      <Tooltip formatter={(value, name) => [formatPrice(+value), name]} />
      <Legend />
      <Line
        type="monotone"
        dataKey="sale"
        stroke="#8884d8"
        activeDot={{ r: 8 }}
      />
    </LineChart>
  );
};

export default SalesChart;
