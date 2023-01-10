/** @format */
import { CartManager }       from '../index';
import taxDisabled           from './fixtures/tax/no-tax';
import { createCartManager } from './helpers/cart';

let cartManager;

describe( 'Empty Cart Total', () => {
    beforeAll( () => {
        cartManager = new CartManager();
    } );

    test( 'total should be zero', () => {
        expect( cartManager.getTotal( 'total' ) ).toBe( 0 );
    } );
} );

describe( 'Totals - no tax', () => {
    beforeAll( () => {
        yithPosSettings.tax = taxDisabled;
        cartManager         = createCartManager();
    } );

    test( 'total should be the sum of the product prices', () => {
        expect( cartManager.getTotal( 'total' ).toFixed( 2 ) ).toBe( '49.52' );
    } );

    test( 'total tax should zero', () => {
        expect( cartManager.getTotal( 'totalTax' ) ).toBe( 0 );
    } );
} );

describe( 'Totals - no tax - Big Cart', () => {
    beforeAll( () => {
        yithPosSettings.tax = taxDisabled;
        cartManager         = createCartManager( { items: 'big' } );
    } );

    test( 'total should be the sum of the product prices', () => {
        expect( cartManager.getTotal( 'total' ).toFixed( 2 ) ).toBe( '170.58' );
    } );

    test( 'total tax should zero', () => {
        expect( cartManager.getTotal( 'totalTax' ) ).toBe( 0 );
    } );
} );