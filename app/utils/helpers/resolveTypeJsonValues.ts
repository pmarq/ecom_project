import { JsonValue } from "@prisma/client/runtime/library";

interface TPrice {
  base: number;
  discounted: number;
}

export function resolveTypeJsonValues(price?: TPrice | JsonValue) {
  const newPrice1 = JSON.stringify(price);
  const newPrice2 = JSON.parse(newPrice1);

  return newPrice2;
}