import { useEffect, useState } from "react";
import { formatProductPrice, orderProducts } from "@forever/shared";
import axios from "axios";
import { toast } from "react-toastify";
import { BACKEND_URL } from "../config";
import { useAdminAuth } from "../auth/AdminAuthContext";

const List = () => {
  const { token } = useAdminAuth();
  const [list, setList] = useState([]);

  const fetchList = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/product/list`, {
        headers: { token },
      });

      if (response.data.success) {
        setList(orderProducts(response.data.data.products));
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const removeProduct = async (id) => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/product/remove`,
        { id },
        {
          headers: { token },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // Move a Product one place and persist the whole order. The list already is
  // the admin-set order, so the new order is sent as-is; the API stores each
  // Product's position from it.
  const moveProduct = async (index, offset) => {
    const target = index + offset;
    if (target < 0 || target >= list.length) return;

    const next = [...list];
    [next[index], next[target]] = [next[target], next[index]];
    setList(next);

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/product/reorder`,
        { order: next.map((product) => product._id) },
        { headers: { token } }
      );

      if (!response.data.success) {
        toast.error(response.data.message);
        fetchList();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
      fetchList();
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <>
      <p className="mb-2">All Products List</p>
      <p className="mb-4 text-sm text-gray-500">
        Use the arrows to set the order products appear in the storefront. New
        products are added at the end.
      </p>

      <div className="flex flex-col gap-2">
        {/* list table title */}
        <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center py-1 px-2 border border-gray-400 bg-gray-100 text-sm text-gray-600">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b className="text-center">Order</b>
        </div>

        {/* Product List  */}

        {list.map((product, index) => (
          <div
            key={product._id}
            className="grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border border-gray-200 text-sm"
          >
            <img
              src={product.image[0]}
              alt={product.name}
              className="w-10 h-10 object-cover"
            />
            <p>{product.name}</p>
            <p>{product.category}</p>
            <p>{formatProductPrice(product.price)}</p>
            <div className="flex items-center justify-end md:justify-center gap-3 text-lg">
              <button
                onClick={() => moveProduct(index, -1)}
                disabled={index === 0}
                className="cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                title="Move up"
                aria-label={`Move ${product.name} up`}
              >
                ↑
              </button>
              <button
                onClick={() => moveProduct(index, 1)}
                disabled={index === list.length - 1}
                className="cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                title="Move down"
                aria-label={`Move ${product.name} down`}
              >
                ↓
              </button>
              <button
                onClick={() => removeProduct(product._id)}
                className="cursor-pointer"
                title="Remove"
                aria-label={`Remove ${product.name}`}
              >
                X
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default List;
