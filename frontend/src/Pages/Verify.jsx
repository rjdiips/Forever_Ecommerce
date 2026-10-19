import React, { useContext, useEffect } from 'react';
import { ShopContext } from '../Context/ShopContext';
import { useCart } from '../cart/CartContext';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

import { toast } from 'react-toastify';

const Verify = () => {
  const { navigate, token, backendUrl } = useContext(ShopContext);
  const { clear } = useCart();
  const [searchParams] = useSearchParams();

  const success = searchParams.get('success');
  const orderId = searchParams.get('orderId');
  const sessionId = searchParams.get('session_id');

  const verifyStripePayment = async () => {
    try {
      if (!token) {
        return null;
      }

      await axios.post(
        backendUrl + '/api/order/verifyStripe',
        { success, orderId, sessionId },
        {
          headers: { token },
        }
      );

      clear();
      navigate('/orders');
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
      navigate('/cart');
    }
  };

  useEffect(() => {
    verifyStripePayment();
  }, [token]);
  return (
    <div>
      <p className='text-gray-500'>Verifying payment...</p>
    </div>
  );
};

export default Verify;
