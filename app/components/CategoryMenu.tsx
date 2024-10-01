"use client";

import React from "react";
import HorizontalMenu from "./HorizontalMenu";
import categories from "../utils/categories";
import { Chip } from "@material-tailwind/react";
import Link from "next/link";

export default function CategoryMenu() {
  return (
    /*  <HorizontalMenu> */
    <div>
      {categories.map((c) => (
        <a key={c} href={`/browse-products/${c}`}>
          <span className="inline-block bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm font-medium mr-2">
            {c}
          </span>
        </a>
      ))}
    </div>
    /*  </HorizontalMenu> */
  );
}
