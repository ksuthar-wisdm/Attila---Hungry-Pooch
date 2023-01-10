import { createCoupon } from '../../helpers/coupons';

const coupon = {
    code         : 'percentage',
    discount_type: 'percent',
    amount       : '10.00'
};

export default createCoupon( coupon );