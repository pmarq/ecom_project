"use client";

import React from "react";
import HorizontalMenu from "./HorizontalMenu";
import categories from "../utils/categories";
import { Chip } from "@material-tailwind/react";
import Link from "next/link";

export default function CategoryMenu() {
  return (
    <HorizontalMenu>
      {categories.map((c) => (
        <Link key={c} href={`/browse-products/${c}`}>
          <Chip color="teal" className="mr-2" variant="outlined" value={c} />
        </Link>
      ))}
    </HorizontalMenu>
  );
}
