import { formatMoney } from '@forever/shared';
import { useCart } from '../cart/CartContext';
import Title from './Title';

const CartTotal = () => {
  const { subtotal, deliveryFee, total } = useCart();

  return (
    <div className='w-full'>
      <div className='text-2xl'>
        <Title text1={'CART'} text2={'TOTAL'} />
      </div>

      <div className='flex flex-col gap-2 mt-2 text-sm '>
        <div className='flex justify-between'>
          <p>Subtotal</p>
          <p>{formatMoney(subtotal)}</p>
        </div>
        <div className='flex justify-between'>
          <p>Shipping Fee</p>
          <p>{formatMoney(deliveryFee)}</p>
        </div>
        <div className='flex justify-between'>
          <p>Total</p>
          <p>{formatMoney(total)}</p>
        </div>
      </div>
    </div>
  );
};

export default CartTotal;
