/** @format */
import taxPricesIncludeTax   from './fixtures/tax/prices-include-tax';
import { createCartManager } from './helpers/cart';

let cartManager;


describe( 'Totals - prices include tax', () => {
    beforeAll( () => {
        yithPosSettings.tax = taxPricesIncludeTax;
        cartManager         = createCartManager();
    } );

    test( 'subtotal should be the sum of the product prices without taxes', () => {
        expect( cartManager.getTotal( 'subtotal' ).toFixed( 2 ) ).toBe( '44.68' );
    } );

    test( 'total should be the sum of the product prices including taxes', () => {
        expect( cartManager.getTotal( 'total' ).toFixed( 2 ) ).toBe( '49.51' );
    } );

    test( 'total tax should be the sum of the product taxes', () => {
        expect( cartManager.getTotal( 'totalTax' ).toFixed( 2 ) ).toBe( '4.83' );
    } );

} );


describe( 'Totals - prices include tax - Big Cart', () => {
    beforeAll( () => {
        yithPosSettings.tax = taxPricesIncludeTax;
        cartManager         = createCartManager( { items: 'big' } );
    } );

    test( 'Subtotal', () => {
        expect( cartManager.getTotal( 'subtotal' ).toFixed( 2 ) ).toBe( '139.64' );
    } );

    test( 'Total', () => {
        expect( cartManager.getTotal( 'total' ).toFixed( 2 ) ).toBe( '170.57' );
    } );

    test( 'Total Tax', () => {
        expect( cartManager.getTotal( 'totalTax' ).toFixed( 2 ) ).toBe( '30.93' );
    } );
} );


describe( 'Totals - prices include tax - Tax Rounding ticket #166806', () => {
    beforeEach( () => {
        yithPosSettings.tax = {
            enabled              : true,
            priceIncludesTax     : true,
            showPriceIncludingTax: false,
            classesAndRates      : {
                ''            : [
                    { rate: 20, label: 'VAT', shipping: 'yes', compound: 'no' },
                ],
            },
            classes              : [''],
            classesLabels        : [''],
            roundAtSubtotal      : false
        };
        cartManager         = createCartManager( { items: [ { qty: 3, product: { price: 2.75 } } ] } );
    } );

    test( 'Subtotal', () => {
        expect( cartManager.getTotal( 'subtotal' ).toFixed( 2 ) ).toBe( '6.88' );
    } );

    test( 'Total', () => {
        expect( cartManager.getTotal( 'total' ).toFixed( 2 ) ).toBe( '8.25' );
    } );

    test( 'Total Tax', () => {
        expect( cartManager.getTotal( 'totalTax' ).toFixed( 2 ) ).toBe( '1.37' );
    } );
} );