import { createCoupon } from '../../../helpers/coupons';

const coupon = {
    code            : 'fixed_cart_minimum_amount',
    discount_type   : 'fixed_cart',
    amount          : '10.00',
    'minimum_amount': '50.00'
};

export default createCoupon( coupon );