import React from "react";
import Image from "next/image";
import dateFormat from "dateformat";
import ReviewStars from "./ReviewStars";

interface Review {
  id: string;
  rating: number;
  comment: string;
  date: string;
  userInfo: {
    id: string;
    name: string;
    avatar?: string;
  };
}

/* interface Props {
  reviews: Review[];
} */

interface Props {
  id: string;
  rating: number;
  comment: string | null;
  productTitle: string;
  productThumbnailUrl: string;
  userName: string | null;
  userAvatar: string | null;
  date: string;
}

export default function ReviewsList({ reviews }: { reviews: Props[] }) {
  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        return (
          <div className="space-y-2" key={review.id}>
            <div className="flex items-center space-x-2">
              <Image
                width={40}
                height={40}
                className="rounded-full object-fill"
                src={review.userAvatar || "/avatar.png"}
                alt={review.userName || ""}
              />
              <div>
                <p className="font-semibold">{review.userName}</p>
                <p className="text-xs">
                  {dateFormat(review.date, "dd mmm  yyyy")}
                </p>
              </div>
            </div>
            <div>
              <ReviewStars rating={review.rating} />
              <p>{review.comment}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
