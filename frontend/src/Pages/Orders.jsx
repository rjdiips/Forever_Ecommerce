import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { formatMoney, orderItemPriceCents } from "@forever/shared";
import InlineNotice from "../Components/InlineNotice";
import PageHeading from "../Components/PageHeading";
import { useAuth } from "../auth/AuthContext";
import { BACKEND_URL } from "../config";

const formatDate = (date) =>
  date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const Orders = () => {
  const { token } = useAuth();

  // Orders data
  const [orderData, setOrderData] = useState([]);
  // A failed history is the list's own problem, so it renders in the list
  // rather than as a toast (ADR-0008).
  const [loadError, setLoadError] = useState(false);

  // Fetch the orders data
  const fetchOrderData = async () => {
    try {
      setLoadError(false);

      if (!token) {
        return null;
      }

      const response = await axios.post(
        BACKEND_URL + "/api/order/userorders",
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        let allOrderItem = [];
        response.data.data.orders.map((order) => {
          order.items.map((item) => {
            item["orderStatus"] = order.orderStatus;
            item["payment"] = order.payment;
            item["paymentMethod"] = order.paymentMethod;
            item["date"] = order.date;
            item["price"] = orderItemPriceCents(item, order);
            allOrderItem.push(item);
          });
        });

        setOrderData(allOrderItem);
      }
    } catch (error) {
      console.log(error);
      setLoadError(true);
    }
  };

  useEffect(() => {
    fetchOrderData();
  }, [token]);

  return (
    <div className="border-t pt-10">
      <PageHeading
        label="Forever / Account"
        title="Your orders"
        note={
          orderData.length
            ? `${orderData.length} ${orderData.length === 1 ? "piece" : "pieces"} ordered`
            : null
        }
      />

      {loadError ? (
        <div className="mt-10 border-b border-gray-200 py-16 text-center">
          <InlineNotice className="justify-center">
            We couldn&rsquo;t load your orders. Refresh to try again.
          </InlineNotice>
        </div>
      ) : orderData.length === 0 ? (
        <div className="mt-10 border-b border-gray-200 pb-16 pt-14 text-center">
          <p className="text-[9px] uppercase tracking-[0.3em] text-[#a85580]">
            Forever / Nothing here
          </p>
          <p className="editorial-display mt-3 text-2xl text-[#111]">
            No orders yet.
          </p>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-gray-600">
            Orders you place will appear here, with their status and payment.
          </p>
          <Link
            to="/collection"
            className="mt-6 inline-flex items-center gap-2 border-b border-current pb-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] transition-opacity hover:opacity-60"
          >
            Shop the collection
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      ) : (
        <ul className="mt-2">
          {orderData.map((item, index) => (
            <li
              key={index}
              className="flex flex-wrap items-start gap-5 border-b border-gray-200 py-5 sm:gap-6"
            >
              <div className="w-20 shrink-0 bg-gray-100 sm:w-24">
                <img
                  src={item.design || item.image[0]}
                  alt={item.design ? "Your custom design" : ""}
                  className="aspect-[390/450] w-full object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[15px] leading-snug text-[#111]">
                  {item.name}
                </p>

                <p className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-[10px] uppercase tracking-[0.18em] text-gray-500">
                  <span className="tabular-nums">
                    {formatMoney(item.price)} each
                  </span>
                  <span className="tabular-nums">Qty {item.quantity}</span>
                  <span>Size {item.size}</span>
                  <span className="tabular-nums">
                    {item.date ? formatDate(new Date(item.date)) : ""}
                  </span>
                </p>

                <p className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-[10px] uppercase tracking-[0.18em]">
                  <span className="text-gray-500">
                    {item.paymentMethod === "cod"
                      ? "Cash on delivery"
                      : "Card / Stripe"}
                  </span>
                  <span
                    className={
                      item.payment ? "text-[#111]" : "text-[#8f4a56]"
                    }
                  >
                    {item.payment ? "Paid" : "Not paid"}
                  </span>
                  {item.design ? (
                    <span className="text-gray-500">Custom design</span>
                  ) : null}
                </p>
              </div>

              <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:flex-col sm:items-end sm:gap-3">
                <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-[#111]">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full bg-[#c586a5]"
                  />
                  {item.orderStatus}
                </p>
                <button
                  type="button"
                  onClick={fetchOrderData}
                  className="border border-gray-300 px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-gray-600 transition-colors hover:border-[#111] hover:text-[#111]"
                >
                  Refresh status
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Orders;
