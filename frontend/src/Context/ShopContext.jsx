import { createContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { catalogueProducts } from '@forever/shared';
import axios from 'axios';

export const ShopContext = createContext();

const ShopContextProvider = ({ children }) => {
  const currency = '$';
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate(); // to navigate to different pages
  // Everything the API returned, the custom-tee base included. The Cart needs
  // the base to price a Custom Tee line, so it is kept alongside the catalogue.
  const [allProducts, setAllProducts] = useState([]);
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');

  const getProductsData = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/product/list');
      if (response.data.success) {
        setAllProducts(response.data.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  useEffect(() => {
    getProductsData();
  }, []);

  const value = {
    // The shop catalogue: every product except the custom-tee base.
    products: catalogueProducts(allProducts),
    // The full list, for lookups that must resolve the base (the Cart, checkout).
    allProducts,
    currency,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    navigate,
    backendUrl,
    token,
    setToken,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export default ShopContextProvider;
