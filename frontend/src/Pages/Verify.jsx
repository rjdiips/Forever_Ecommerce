import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useCart } from '../cart/CartContext';
import { BACKEND_URL } from '../config';
import axios from 'axios';

import { toast } from 'react-toastify';

const Verify = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
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
        BACKEND_URL + '/api/order/verifyStripe',
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
