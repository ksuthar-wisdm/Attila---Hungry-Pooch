import { getCoupon } from '../../records/coupon';

let couponCounter = 0;

export const createCoupon = function ( params = {} ) {
	couponCounter++;
	if ( !'code' in params ) {
		params.code = 'dummy_coupon_' + couponCounter;
	}

	params.id = couponCounter;
	return getCoupon( params );
};