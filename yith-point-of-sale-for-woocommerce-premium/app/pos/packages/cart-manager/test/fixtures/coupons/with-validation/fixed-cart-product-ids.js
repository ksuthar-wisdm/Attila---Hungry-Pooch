import { createCoupon } from '../../../helpers/coupons';

const coupon = {
    code         : 'fixed_cart_product_ids',
    discount_type: 'fixed_cart',
    amount       : '10.00',
    product_ids  : [1, 2]
};

export default createCoupon( coupon );