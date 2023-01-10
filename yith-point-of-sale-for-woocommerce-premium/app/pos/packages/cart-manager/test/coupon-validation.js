/** @format */
import { createCartItem, createCartManager } from './helpers/cart';
import taxDisabled                           from './fixtures/tax/no-tax';

import CouponFixedCartExpiryDateValid   from './fixtures/coupons/with-validation/fixed-cart-expiry-date-valid';
import CouponFixedCartExpiryDateInvalid from './fixtures/coupons/with-validation/fixed-cart-expiry-date-invalid';
import CouponFixedCartMinimumAmount     from './fixtures/coupons/with-validation/fixed-cart-minimum-amount';
import CouponFixedCartMaximumAmount     from './fixtures/coupons/with-validation/fixed-cart-maximum-amount';
import CouponFixedCartUsageLimitReached from './fixtures/coupons/with-validation/fixed-cart-usage-limit-reached';
import CouponFixedCartProductIds        from './fixtures/coupons/with-validation/fixed-cart-product-ids';

yithPosSettings.tax = taxDisabled;

describe( 'Coupon Validations', () => {
    let appliedCoupon;
    let cartManager;
    beforeEach( () => {
        const items = [
            { qty: 1, product: { price: 10 } },
            { qty: 1, product: { price: 30 } }
        ];
        cartManager = createCartManager( { items: items } );
    } );

    test( 'CouponFixedCartExpiryDateValid and removing', () => {
        cartManager.addCoupon( CouponFixedCartExpiryDateValid );
        appliedCoupon = cartManager.getAppliedCoupon( CouponFixedCartExpiryDateValid.code );
        expect( appliedCoupon ).not.toBe( false );
        expect( appliedCoupon.error ).toBeUndefined();

        cartManager.removeCoupon( CouponFixedCartExpiryDateValid.code );
        appliedCoupon = cartManager.getAppliedCoupon( CouponFixedCartExpiryDateValid.code );
        expect( appliedCoupon ).toBe( false );
    } );

    test( 'CouponFixedCartExpiryDateInvalid', () => {
        cartManager.addCoupon( CouponFixedCartExpiryDateInvalid );
        appliedCoupon = cartManager.getAppliedCoupon( CouponFixedCartExpiryDateInvalid.code );
        expect( appliedCoupon ).not.toBe( false );
        expect( appliedCoupon.error ).not.toBeUndefined();
    } );

    test( 'CouponFixedCartMinimumAmount', () => {
        cartManager.addCoupon( CouponFixedCartMinimumAmount );
        appliedCoupon = cartManager.getAppliedCoupon( CouponFixedCartMinimumAmount.code );
        expect( appliedCoupon ).not.toBe( false );
        expect( appliedCoupon.error ).toBeDefined();

        cartManager.addCartItem( createCartItem( { price: '20.00' } ) );
        appliedCoupon = cartManager.getAppliedCoupon( CouponFixedCartMinimumAmount.code );
        expect( appliedCoupon ).not.toBe( false );
        expect( appliedCoupon.error ).toBeUndefined();
    } );

    test( 'CouponFixedCartMaximumAmount', () => {
        cartManager.addCoupon( CouponFixedCartMaximumAmount );
        appliedCoupon = cartManager.getAppliedCoupon( CouponFixedCartMaximumAmount.code );
        expect( appliedCoupon ).not.toBe( false );
        expect( appliedCoupon.error ).toBeUndefined();

        cartManager.addCartItem( createCartItem( { price: '20.00' } ) );
        appliedCoupon = cartManager.getAppliedCoupon( CouponFixedCartMaximumAmount.code );
        expect( appliedCoupon ).not.toBe( false );
        expect( appliedCoupon.error ).toBeDefined();
    } );

    test( 'CouponFixedCartUsageLimitReached', () => {
        cartManager.addCoupon( CouponFixedCartUsageLimitReached );
        appliedCoupon = cartManager.getAppliedCoupon( CouponFixedCartUsageLimitReached.code );
        expect( appliedCoupon ).not.toBe( false );
        expect( appliedCoupon.error ).toBeDefined();
    } );

    test( 'CouponFixedCartProductIds', () => {
        cartManager.addCoupon( CouponFixedCartProductIds );
        appliedCoupon = cartManager.getAppliedCoupon( CouponFixedCartProductIds.code );
        expect( appliedCoupon ).not.toBe( false );
        expect( appliedCoupon.error ).toBeDefined();

        cartManager.emptyCart();
        cartManager.addCartItem( createCartItem( { id: 1, price: '20.00' } ) );
        cartManager.addCoupon( CouponFixedCartProductIds );
        appliedCoupon = cartManager.getAppliedCoupon( CouponFixedCartProductIds.code );
        expect( appliedCoupon ).not.toBe( false );
        expect( appliedCoupon.error ).toBeUndefined();
    } );
} );
