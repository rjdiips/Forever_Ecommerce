import { formatMoney } from "@forever/shared";
import { useCart } from "../cart/CartContext";

// The money block on the Cart and on Place Order. It is the same plate in both
// places: subtotal and shipping as hairlines, then the total in the display
// face behind the only black rule in the block.
const CartTotal = () => {
  const { subtotal, deliveryFee, total } = useCart();

  const rows = [
    { label: "Subtotal", value: subtotal },
    { label: "Shipping", value: deliveryFee },
  ];

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4 border-b border-gray-200 pb-3">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#111]">
          Order summary
        </h2>
        <p className="text-[9px] uppercase tracking-[0.22em] text-[#a85580]">
          Forever / Total
        </p>
      </div>

      <dl className="mt-4 flex flex-col gap-3 text-[13px] text-gray-600">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-baseline justify-between gap-4"
          >
            <dt>{row.label}</dt>
            <dd className="tabular-nums">{formatMoney(row.value)}</dd>
          </div>
        ))}

        <div className="mt-3 flex items-baseline justify-between gap-4 border-t border-[#111] pt-4">
          <dt className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#111]">
            Total
          </dt>
          <dd className="editorial-display text-2xl leading-none text-[#111] tabular-nums">
            {formatMoney(total)}
          </dd>
        </div>
      </dl>
    </div>
  );
};

export default CartTotal;
