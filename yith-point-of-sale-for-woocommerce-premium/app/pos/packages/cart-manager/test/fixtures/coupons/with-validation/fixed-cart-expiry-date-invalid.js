import { createCoupon }         from '../../../helpers/coupons';
import { format as formatDate } from '@wordpress/date';

let today = new Date();

const coupon = {
    code         : 'fixed_cart_expiry_date_invalid',
    discount_type: 'fixed_cart',
    amount       : '10.00',
    date_expires : formatDate( 'Y-m-d', today ) + 'T00:00:00'
};

export default createCoupon( coupon );