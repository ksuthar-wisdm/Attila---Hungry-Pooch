/** @format */
import taxPricesNotIncludeTax from './fixtures/tax/prices-not-include-tax';
import { createCartManager }  from './helpers/cart';

let cartManager;

describe( "Totals - prices don't include tax", () => {
    beforeAll( () => {
        yithPosSettings.tax = taxPricesNotIncludeTax;
        cartManager         = createCartManager();
    } );

    test( 'totals with taxes should be the sum of the product prices without taxes', () => {
        expect( cartManager.getTotal( 'subtotal' ).toFixed( 2 ) ).toBe( '49.52' );
    } );

    test( 'total should be the sum of the product prices including taxes', () => {
        expect( cartManager.getTotal( 'total' ).toFixed( 2 ) ).toBe( '55.32' );
    } );

    test( 'total tax should be the sum of the product taxes', () => {
        expect( cartManager.getTotal( 'totalTax' ).toFixed( 2 ) ).toBe( '5.80' );
    } );
} );

describe( 'Totals - prices not include tax - Big Cart', () => {
    beforeAll( () => {
        yithPosSettings.tax = taxPricesNotIncludeTax;
        cartManager         = createCartManager( { items: 'big' } );
    } );

    test( 'Subtotal', () => {
        expect( cartManager.getTotal( 'subtotal' ).toFixed( 2 ) ).toBe( '170.58' );
    } );

    test( 'Total', () => {
        expect( cartManager.getTotal( 'total' ).toFixed( 2 ) ).toBe( '209.26' );
    } );

    test( 'Total Tax', () => {
        expect( cartManager.getTotal( 'totalTax' ).toFixed( 2 ) ).toBe( '38.68' );
    } );
} );
