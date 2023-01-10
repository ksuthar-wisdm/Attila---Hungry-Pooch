import { createCoupon }         from '../../../helpers/coupons';
import { format as formatDate } from '@wordpress/date';

let tomorrow = new Date();
tomorrow.setDate( tomorrow.getDate() + 1 );

const coupon = {
    code         : 'fixed_cart_expiry_date_valid',
    discount_type: 'fixed_cart',
    amount       : '10.00',
    date_expires : formatDate( 'Y-m-d', tomorrow ) + 'T00:00:00'
};

export default createCoupon( coupon );