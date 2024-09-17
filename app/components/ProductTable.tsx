"use client";

import { PencilIcon } from "@heroicons/react/24/solid";
import { PlusIcon } from "@heroicons/react/24/outline";
import {
  Typography,
  CardBody,
  CardFooter,
  Avatar,
  IconButton,
  Button,
} from "@material-tailwind/react";
import truncate from "truncate";
import { redirect, useRouter } from "next/navigation";
import Link from "next/link";
import SearchForm from "./SearchForm";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { fetchProducts } from "../(admin)/products/action";
import { resolveTypeJsonValues } from "../utils/helpers/resolveTypeJsonValues";
import { Prisma } from "@prisma/client";

export interface Product {
  id: string;
  title: string;
  thumbnail: string;
  description: string;
  price: {
    mrp: number;
    salePrice: number;
    saleOff: number;
  };
  category: string;
  quantity: number;
}

const formatPrice = (amount: number) => {
  const formatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return formatter.format(amount);
};

const TABLE_HEAD = [
  "Product",
  "MRP",
  "Sale Price",
  "Quantity",
  "Category",
  "Edit",
];

interface Props {
  currentPageNo: number;
  hasMore?: boolean;
  showPageNavigator?: boolean;
  productsSearch?: Prods[];
  query?: string;
}

interface Prods {
  category: string;
  price: Prisma.JsonValue;

  quantity: number;
  thumbnails: {
    id: string;
    productId: string;
    url: string;
  }[];
  title: string;
  id: string;
}

let hasMore: boolean;

export default function ProductTable(props: Props) {
  const router = useRouter();
  const { currentPageNo, showPageNavigator = true, productsSearch } = props;
  const newQuery = props?.query;
  const [sttQuery, setQuery] = useState("");
  const [sttProds, setProds] = useState<Prods[]>([]);
  const [sttProdsFirstTime, setProdsFirstTime] = useState<boolean>(true);

  const productsPerPage = 10;

  const session = useSession();
  const userId = session.data?.user.id;

  if (!userId) {
    // Redireciona o usuário para a página de login caso não esteja autenticado
    router.push("/auth/signin");
    return null; // Garante que nada mais seja renderizado enquanto o redirecionamento acontece
  }

  if (newQuery) {
    const cond = sttQuery === newQuery;
    if (!cond) {
      setQuery(newQuery);
      setProdsFirstTime(true);
    }
  }

  async function getProducts(userId: string) {
    if (!userId) return null;

    if (isNaN(+currentPageNo)) return redirect("/404");

    let allProds = await fetchProducts(userId, +currentPageNo, productsPerPage);

    if (allProds.length < productsPerPage) {
      hasMore = false;
    } else hasMore = true;

    const prod1id = allProds[0]?.id;
    const prod2id = sttProds[0]?.id;

    if (prod1id != prod2id) {
      setProds(allProds);
    }

    if (allProds && sttProdsFirstTime) {
      setProds(allProds), setProdsFirstTime(false);
    }
  }

  if (!productsSearch && userId) {
    getProducts(userId);
  }

  if (productsSearch && sttProdsFirstTime) {
    setProds(productsSearch), setProdsFirstTime(false);
  }

  const handleOnPrevPress = () => {
    const prevPage = currentPageNo - 1;
    if (prevPage > 0) router.push(`/products?page=${prevPage}`);
  };

  const handleOnNextPress = () => {
    const nextPage = currentPageNo + 1;
    router.push(`/products?page=${nextPage}`);
  };

  return (
    <div className="py-5">
      <div className="mb-4 flex flex-col justify-between gap-8 md:flex-row md:items-center">
        <div>
          <Typography variant="h5" color="blue-gray">
            Products
          </Typography>
        </div>
        <div className="flex w-full shrink-0 gap-2 md:w-max">
          <SearchForm submitTo="/products/search?query=" />

          <Link
            href="/products/create"
            className="select-none font-bold text-center uppercase transition-all text-xs py-2 px-4 rounded-lg bg-blue-500 text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none flex items-center gap-3"
          >
            <PlusIcon strokeWidth={2} className="h-4 w-4" />{" "}
            <span>Add New</span>
          </Link>
        </div>
      </div>
      <CardBody className="px-0">
        <table className="w-full min-w-max table-auto text-left">
          <thead>
            <tr>
              {TABLE_HEAD.map((head) => (
                <th
                  key={head}
                  className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4"
                >
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal leading-none opacity-70"
                  >
                    {head}
                  </Typography>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sttProds.map((item: Prods, index: number) => {
              const thumbnail = item.thumbnails[0].url;
              const { id, title, price, quantity, category } = item;

              //newprice//
              let newPrice = resolveTypeJsonValues(price);

              const isLast = index === sttProds.length - 1;
              const classes = isLast
                ? "p-4"
                : "p-4 border-b border-blue-gray-50";

              return (
                <tr key={id}>
                  <td className={classes}>
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={thumbnail}
                        alt={title}
                        size="md"
                        variant="rounded"
                      />
                      <Link href={`/${title}/${id}`}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-bold"
                        >
                          {truncate(title, 30)}
                        </Typography>
                      </Link>
                    </div>
                  </td>
                  <td className={classes}>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal"
                    >
                      {formatPrice(newPrice.base)}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal"
                    >
                      {formatPrice(newPrice.discounted)}
                    </Typography>
                  </td>
                  <td className={classes}>
                    <div className="w-max">
                      <Typography variant="small" color="blue-gray">
                        {quantity}
                      </Typography>
                    </div>
                  </td>
                  <td className={classes}>
                    <div className="w-max">
                      <Typography variant="small" color="blue-gray">
                        {category}
                      </Typography>
                    </div>
                  </td>
                  <td className={classes}>
                    <Link href={`/products/update/${id}`}>
                      <IconButton variant="text" color="blue-gray">
                        <PencilIcon className="h-4 w-4" />
                      </IconButton>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardBody>
      {showPageNavigator ? (
        <CardFooter className="flex items-center justify-center border-t border-blue-gray-50 p-4">
          <div className="flex items-center gap-2">
            <Button
              disabled={currentPageNo === 1}
              onClick={handleOnPrevPress}
              variant="text"
            >
              Previous
            </Button>
            <Button
              disabled={!hasMore}
              onClick={handleOnNextPress}
              variant="text"
            >
              Next
            </Button>
          </div>
        </CardFooter>
      ) : null}
    </div>
  );
}
