import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "../Components/Button";
import CartTotal from "../Components/CartTotal";
import Field from "../Components/Field";
import InlineNotice from "../Components/InlineNotice";
import PageHeading from "../Components/PageHeading";
import { useAuth } from "../auth/AuthContext";
import { useCart } from "../cart/CartContext";
import { BACKEND_URL } from "../config";

const PAYMENT_METHODS = [
  { value: "stripe", label: "Card — Stripe", note: "Paid now" },
  { value: "cod", label: "Cash on delivery", note: "Paid on arrival" },
];

const PlaceOrder = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { lineItems, count, clear } = useCart();

  const [paymentMethod, setPaymentMethod] = useState("cod");
  // A refused order is the form's own problem, so it renders here and the
  // filled-in address survives (ADR-0008).
  const [submitError, setSubmitError] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  const onChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setFormData((data) => ({ ...data, [name]: value }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setSubmitError("");

    try {
      // Intent only: the server prices every line from the catalogue. Any
      // amount sent from here would be ignored.
      const orderItems = lineItems.map((line) => ({
        productId: line.productId,
        size: line.size,
        quantity: line.quantity,
        ...(line.design ? { design: line.design } : {}),
      }));

      const orderData = {
        address: formData,
        items: orderItems,
      };
      switch (paymentMethod) {
        // API calls for COD payment method
        case "cod": {
          const response = await axios.post(
            `${BACKEND_URL}/api/order/place`,
            orderData,
            { headers: { token } }
          );

          if (response.data.success) {
            clear();
            navigate("/orders");
          } else {
            setSubmitError(
              response.data.message ||
                "We couldn't place your order. Please try again."
            );
          }
          break;
        }

        // API calls for Stripe payment method
        case "stripe": {
          const response = await axios.post(
            `${BACKEND_URL}/api/order/stripe`,
            orderData,
            { headers: { token } }
          );

          if (response.data.success) {
            const { sessionUrl } = response.data.data;
            window.location.replace(sessionUrl);
          } else {
            setSubmitError(
              response.data.message ||
                "We couldn't place your order. Please try again."
            );
          }
          break;
        }

        default:
          break;
      }
    } catch (error) {
      console.log(error);
      setSubmitError(
        error.response?.data?.message ||
          "We couldn't reach Forever. Check your connection and try again."
      );
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="border-t pt-10">
      <PageHeading
        label="Forever / Checkout"
        title="Place order"
        note={`${count} ${count === 1 ? "piece" : "pieces"} in this order`}
      />

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] lg:gap-14">
        {/* --------------- Delivery ----------------------- */}

        <div>
          <div className="flex items-end justify-between gap-4 border-b border-gray-200 pb-3">
            <h2 className="editorial-display text-2xl text-[#111]">
              Delivery information
            </h2>
            <p className="text-[9px] uppercase tracking-[0.22em] text-gray-400">
              Where it goes
            </p>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field
              id="first-name"
              name="firstName"
              label="First name"
              value={formData.firstName}
              onChange={onChangeHandler}
              placeholder="Jane"
              autoComplete="given-name"
              required
            />
            <Field
              id="last-name"
              name="lastName"
              label="Last name"
              value={formData.lastName}
              onChange={onChangeHandler}
              placeholder="Doe"
              autoComplete="family-name"
              required
            />
            <Field
              id="email"
              name="email"
              type="email"
              label="Email"
              className="sm:col-span-2"
              value={formData.email}
              onChange={onChangeHandler}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
            <Field
              id="street"
              name="street"
              label="Street"
              className="sm:col-span-2"
              value={formData.street}
              onChange={onChangeHandler}
              placeholder="24 Ash Lane, Apt 3"
              autoComplete="street-address"
              required
            />
            <Field
              id="city"
              name="city"
              label="City"
              value={formData.city}
              onChange={onChangeHandler}
              placeholder="Portland"
              autoComplete="address-level2"
              required
            />
            <Field
              id="state"
              name="state"
              label="State"
              value={formData.state}
              onChange={onChangeHandler}
              placeholder="Oregon"
              autoComplete="address-level1"
              required
            />
            <Field
              id="zipcode"
              name="zipcode"
              label="Zip code"
              value={formData.zipcode}
              onChange={onChangeHandler}
              placeholder="97205"
              autoComplete="postal-code"
              required
            />
            <Field
              id="country"
              name="country"
              label="Country"
              value={formData.country}
              onChange={onChangeHandler}
              placeholder="United States"
              autoComplete="country-name"
              required
            />
            <Field
              id="phone"
              name="phone"
              type="number"
              label="Phone"
              className="sm:col-span-2"
              value={formData.phone}
              onChange={onChangeHandler}
              placeholder="555 0100"
              autoComplete="tel"
              required
            />
          </div>

          <Link
            to="/cart"
            className="mt-8 inline-flex items-center gap-2 border-b border-current pb-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-gray-600 transition-colors hover:text-[#111]"
          >
            <span aria-hidden="true">←</span>
            Back to bag
          </Link>
        </div>

        {/* --------------- Summary and payment ----------------------- */}

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="border border-[#111] bg-white p-5 shadow-[7px_7px_0_rgba(17,17,17,0.06)] sm:p-6">
            <CartTotal />

            <fieldset className="mt-6 border-t border-gray-200 pt-5">
              <legend className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#111]">
                Payment method
              </legend>

              <div className="mt-3 flex flex-col gap-2">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method.value}
                    className={`flex cursor-pointer items-center gap-3 border px-3 py-3 transition-colors ${
                      paymentMethod === method.value
                        ? "border-[#111] bg-gray-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.value}
                      checked={paymentMethod === method.value}
                      onChange={() => setPaymentMethod(method.value)}
                      className="h-3.5 w-3.5 accent-[#111]"
                    />
                    <span className="flex-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#111]">
                      {method.label}
                    </span>
                    <span className="text-[9px] uppercase tracking-[0.16em] text-gray-400">
                      {method.note}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {submitError ? (
              <InlineNotice className="mt-4">{submitError}</InlineNotice>
            ) : null}

            <Button type="submit" className="mt-6 w-full">
              Place order
              <span aria-hidden="true">→</span>
            </Button>

            <p className="mt-4 text-[11px] leading-relaxed text-gray-500">
              Card payments are handled by Stripe. You will return here once the
              payment is made.
            </p>
          </div>
        </aside>
      </div>
    </form>
  );
};

export default PlaceOrder;
