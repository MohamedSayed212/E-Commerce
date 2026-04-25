import React from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

function RatingStars({ rating }) {
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      // full star
      stars.push(<FaStar key={i} className="text-primary" />);
    } else if (rating >= i - 0.5) {
      // half star
      stars.push(<FaStarHalfAlt key={i} className="text-primary" />);
    } else {
      // empty star
      stars.push(<FaRegStar key={i} className="text-primary" />);
    }
  }

  return (
    <div className="flex items-center">
      <div className="flex gap-[1px]"> {stars}</div>
    </div>
  );
}

export default RatingStars;
