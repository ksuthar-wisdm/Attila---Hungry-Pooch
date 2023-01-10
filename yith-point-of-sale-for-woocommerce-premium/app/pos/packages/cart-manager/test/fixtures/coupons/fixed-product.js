import { createCoupon } from '../../helpers/coupons';

const coupon = {
    code         : 'fixed_product',
    discount_type: 'fixed_product',
    amount       : '2.00'
};

export default createCoupon( coupon );