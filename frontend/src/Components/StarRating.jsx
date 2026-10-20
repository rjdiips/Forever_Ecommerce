import { assets } from "../assets/assets";

/**
 * A five-star row. Renders the filled stars first, then the dull ones, so the
 * product header and each review list share one rule.
 */
const StarRating = ({ rating }) => (
  <>
    {Array.from({ length: 5 }).map((_, index) => (
      <img
        key={index}
        src={index < rating ? assets.star_icon : assets.star_dull_icon}
        alt=""
        className="w-3"
      />
    ))}
  </>
);

export default StarRating;
