/** @format */
import { createCartManager } from './helpers/cart';

import taxDisabled            from './fixtures/tax/no-tax';
import taxPricesIncludeTax    from './fixtures/tax/prices-include-tax';
import taxPricesNotIncludeTax from './fixtures/tax/prices-not-include-tax';

import CouponFixedCart    from './fixtures/coupons/fixed-cart';
import CouponFixedProduct from './fixtures/coupons/fixed-product';
import CouponPercent      from './fixtures/coupons/percent';

let cartManager;

describe( 'Coupon Totals - no tax', () => {
    beforeEach( () => {
        yithPosSettings.tax = taxDisabled;
        cartManager         = createCartManager();
    } );


    test( 'CouponFixedCart', () => {
        cartManager.addCoupon( CouponFixedCart );
        expect( cartManager.getTotal( 'total' ).toFixed( 2 ) ).toBe( '39.52' );
        cartManager.removeCoupon( CouponFixedCart.code );
    } );

    test( 'CouponFixedProduct', () => {
        cartManager.addCoupon( CouponFixedProduct );
        expect( cartManager.getTotal( 'total' ).toFixed( 2 ) ).toBe( '31.52' );
        cartManager.removeCoupon( CouponFixedProduct.code );
    } );

    test( 'CouponPercent', () => {
        cartManager.addCoupon( CouponPercent );
        expect( cartManager.getTotal( 'total' ).toFixed( 2 ) ).toBe( '44.57' );

        cartManager.removeCoupon( CouponPercent.code );
    } );
} );

describe( 'Coupon Totals - prices include tax', () => {
    beforeEach( () => {
        yithPosSettings.tax = taxPricesIncludeTax;
        cartManager         = createCartManager();
    } );

    test( 'CouponFixedCart', () => {
        cartManager.addCoupon( CouponFixedCart );
        expect( cartManager.getTotal( 'total' ).toFixed( 2 ) ).toBe( '39.52' );
        expect( cartManager.getTotal( 'totalTax' ).toFixed( 2 ) ).toBe( '3.52' );
    } );

    test( 'CouponFixedProduct', () => {
        cartManager.addCoupon( CouponFixedProduct );
        expect( cartManager.getTotal( 'total' ).toFixed( 2 ) ).toBe( '31.52' );
        expect( cartManager.getTotal( 'totalTax' ).toFixed( 2 ) ).toBe( '2.46' );
    } );

    test( 'CouponPercent', () => {
        cartManager.addCoupon( CouponPercent );
        expect( cartManager.getTotal( 'total' ).toFixed( 2 ) ).toBe( '44.56' );
        expect( cartManager.getTotal( 'totalTax' ).toFixed( 2 ) ).toBe( '4.35' );
    } );
} );

describe( 'Coupon Totals - prices not include tax', () => {
    beforeEach( () => {
        yithPosSettings.tax = taxPricesNotIncludeTax;
        cartManager         = createCartManager();
    } );

    test( 'CouponFixedCart', () => {
        cartManager.addCoupon( CouponFixedCart );
        expect( cartManager.getTotal( 'total' ).toFixed( 2 ) ).toBe( '43.73' );
        expect( cartManager.getTotal( 'totalTax' ).toFixed( 2 ) ).toBe( '4.21' );
        cartManager.removeCoupon( CouponFixedCart.code );
    } );

    test( 'CouponFixedProduct', () => {
        cartManager.addCoupon( CouponFixedProduct );
        expect( cartManager.getTotal( 'total' ).toFixed( 2 ) ).toBe( '34.44' );
        expect( cartManager.getTotal( 'totalTax' ).toFixed( 2 ) ).toBe( '2.92' );
        cartManager.removeCoupon( CouponFixedProduct.code );
    } );

    test( 'CouponPercent', () => {
        cartManager.addCoupon( CouponPercent );
        expect( cartManager.getTotal( 'total' ).toFixed( 2 ) ).toBe( '49.80' );
        expect( cartManager.getTotal( 'totalTax' ).toFixed( 2 ) ).toBe( '5.23' );
        cartManager.removeCoupon( CouponPercent.code );
    } );
} );

describe( 'Coupon Totals - no tax - big cart', () => {
    beforeEach( () => {
        yithPosSettings.tax = taxDisabled;
        cartManager         = createCartManager( { items: 'big' } );
    } );


    test( 'CouponFixedCart', () => {
        cartManager.addCoupon( CouponFixedCart );
        expect( cartManager.getTotal( 'total' ).toFixed( 2 ) ).toBe( '160.58' );
        cartManager.removeCoupon( CouponFixedCart.code );
    } );

    test( 'CouponFixedProduct', () => {
        cartManager.addCoupon( CouponFixedProduct );
        expect( cartManager.getTotal( 'total' ).toFixed( 2 ) ).toBe( '114.58' );
        cartManager.removeCoupon( CouponFixedProduct.code );
    } );

    test( 'CouponPercent', () => {
        cartManager.addCoupon( CouponPercent );
        expect( cartManager.getTotal( 'total' ).toFixed( 2 ) ).toBe( '153.52' );

        cartManager.removeCoupon( CouponPercent.code );
    } );
} );

describe( 'Coupon Totals - prices include tax - big cart', () => {
    beforeEach( () => {
        yithPosSettings.tax = taxPricesIncludeTax;
        cartManager         = createCartManager( { items: 'big' } );
    } );

    test( 'CouponFixedCart', () => {
        cartManager.addCoupon( CouponFixedCart );
        expect( cartManager.getTotal( 'total' ).toFixed( 2 ) ).toBe( '160.58' );
        expect( cartManager.getTotal( 'totalTax' ).toFixed( 2 ) ).toBe( '29.10' );
        cartManager.removeCoupon( CouponFixedCart.code );
    } );

    test( 'CouponFixedProduct', () => {
        cartManager.addCoupon( CouponFixedProduct );
        expect( cartManager.getTotal( 'total' ).toFixed( 2 ) ).toBe( '114.60' );
        expect( cartManager.getTotal( 'totalTax' ).toFixed( 2 ) ).toBe( '20.74' );
        cartManager.removeCoupon( CouponFixedProduct.code );
    } );

    test( 'CouponPercent', () => {
        cartManager.addCoupon( CouponPercent );
        expect( cartManager.getTotal( 'total' ).toFixed( 2 ) ).toBe( '153.53' );
        expect( cartManager.getTotal( 'totalTax' ).toFixed( 2 ) ).toBe( '27.86' );
        cartManager.removeCoupon( CouponPercent.code );
    } );
} );

describe( 'Coupon Totals - prices not include tax - big cart', () => {
    beforeEach( () => {
        yithPosSettings.tax = taxPricesNotIncludeTax;
        cartManager         = createCartManager( { items: 'big' } );
    } );

    test( 'CouponFixedCart', () => {
        cartManager.addCoupon( CouponFixedCart );
        expect( cartManager.getTotal( 'total' ).toFixed( 2 ) ).toBe( '197.00' );
        expect( cartManager.getTotal( 'totalTax' ).toFixed( 2 ) ).toBe( '36.42' );
        cartManager.removeCoupon( CouponFixedCart.code );
    } );

    test( 'CouponFixedProduct', () => {
        cartManager.addCoupon( CouponFixedProduct );
        expect( cartManager.getTotal( 'total' ).toFixed( 2 ) ).toBe( '140.50' );
        expect( cartManager.getTotal( 'totalTax' ).toFixed( 2 ) ).toBe( '25.92' );
        cartManager.removeCoupon( CouponFixedProduct.code );
    } );

    test( 'CouponPercent', () => {
        cartManager.addCoupon( CouponPercent );
        expect( cartManager.getTotal( 'total' ).toFixed( 2 ) ).toBe( '188.34' );
        expect( cartManager.getTotal( 'totalTax' ).toFixed( 2 ) ).toBe( '34.82' );
        cartManager.removeCoupon( CouponPercent.code );
    } );
} );