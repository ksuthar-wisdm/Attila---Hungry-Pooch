import { createCoupon } from '../../../helpers/coupons';

const coupon = {
    code         : 'fixed_cart_usage_limit_reached',
    discount_type: 'fixed_cart',
    amount       : '10.00',
    usage_limit  : 1,
    usage_count  : 1
};

export default createCoupon( coupon );