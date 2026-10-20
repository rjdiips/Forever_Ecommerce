import StarRating from "../Components/StarRating";

const ReviewList = ({ reviews }) => {
  if (reviews.length === 0) {
    return <p>No reviews yet.</p>;
  }

  return reviews.map((review) => (
    <div
      key={review.id}
      className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0"
    >
      <div className="flex items-center gap-2">
        <span className="font-medium text-gray-800">{review.name}</span>
        <span className="flex gap-0.5">
          <StarRating rating={review.rating} />
        </span>
      </div>
      <p className="mt-1">{review.text}</p>
      <p className="mt-1 text-xs text-gray-400">{review.date}</p>
    </div>
  ));
};

export default ReviewList;
