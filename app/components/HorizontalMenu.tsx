"use client";
import { Chip } from "@material-tailwind/react";
import { ChevronRightIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";
import React, { useContext } from "react";
import { ScrollMenu, VisibilityContext } from "react-horizontal-scrolling-menu";
import Link from "next/link";
import "react-horizontal-scrolling-menu/dist/styles.css";
import categories from "../utils/categories";

function LeftArrow() {
  const { isFirstItemVisible, scrollPrev } = useContext(VisibilityContext);

  return (
    <button
      className="px-2 transition"
      disabled={isFirstItemVisible}
      style={{ opacity: isFirstItemVisible ? "0" : "1" }}
      onClick={() => scrollPrev()}
    >
      <ChevronLeftIcon className="w-4 h-4" />
    </button>
  );
}

function RightArrow() {
  const { isLastItemVisible, scrollNext } = useContext(VisibilityContext);

  return (
    <button
      className="px-2 transition"
      style={{ opacity: isLastItemVisible ? "0" : "1" }}
      disabled={isLastItemVisible}
      onClick={() => scrollNext()}
    >
      <ChevronRightIcon className="w-4 h-4" />
    </button>
  );
}

export default function HorizontalMenu() {
  return (
    <div>
      <ScrollMenu LeftArrow={LeftArrow} RightArrow={RightArrow}>
        {categories.map((c) => (
          <Link key={c} href={`/browse-products/${c}`}>
            <Chip color="teal" className="mr-2" variant="outlined" value={c} />
          </Link>
        ))}
      </ScrollMenu>
    </div>
  );
}

// /* chrome and chromium based */
// .react-horizontal-scrolling-menu--scroll-container::-webkit-scrollbar {
//     display: none;
//   }

//   .react-horizontal-scrolling-menu--scroll-container {
//     -ms-overflow-style: none; /* IE and Edge */
//     scrollbar-width: none; /* Firefox */
//   }
