import { createCoupon } from '../../helpers/coupons';

const coupon = {
    code         : 'fixed_cart',
    discount_type: 'fixed_cart',
    amount       : '10.00'
};

export default createCoupon( coupon );