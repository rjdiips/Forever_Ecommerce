// The product title carries the wordmark's rose dot. A wide or narrow card can
// leave the title filling a line exactly, which used to strand the dot on a line
// of its own, so the last word and the dot are kept in one unbreakable run.
const ProductTitle = ({ name }) => {
  const words = name.trim().split(/\s+/);
  const last = words.pop();
  const lead = words.join(" ");

  return (
    <h1 className="editorial-display mt-4 text-[2.1rem] leading-[0.92] text-[#111] sm:text-[2.7rem]">
      {lead && `${lead} `}
      <span className="whitespace-nowrap">
        {last}
        <span
          aria-hidden="true"
          className="ml-1.5 inline-block h-2 w-2 rounded-full bg-[#b8838e] align-baseline"
        />
      </span>
    </h1>
  );
};

export default ProductTitle;
