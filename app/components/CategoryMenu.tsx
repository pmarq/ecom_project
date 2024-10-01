"use client";

import React from "react";
import HorizontalMenu from "./HorizontalMenu";
import categories from "../utils/categories";
import Link from "next/link";
import dynamic from "next/dynamic";

// Lazy load do componente Chip com SSR desativado
const Chip = dynamic(
  () => import("@material-tailwind/react").then((mod) => mod.Chip),
  {
    ssr: false, // Desativa a renderização no servidor
  }
);

export default function CategoryMenu() {
  return (
    /*  <HorizontalMenu> */
    <div>
      {categories.map((c) => (
        <a key={c} href={`/browse-products/${c}`}>
          <Chip color="teal" className="mr-2" variant="outlined" value={c} />
          {c}
        </a>
      ))}
    </div>
    /*  </HorizontalMenu> */
  );
}
