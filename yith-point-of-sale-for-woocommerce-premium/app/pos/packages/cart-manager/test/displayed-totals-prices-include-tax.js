/** @format */
import { createCartManager }      from './helpers/cart';
import { getTaxPricesIncludeTax } from './fixtures/tax';

let cartManager, totals, shippingMethodId;


describe( 'Displayed Totals - prices include tax - show prices excluding tax', () => {
    beforeAll( () => {
        yithPosSettings.tax = getTaxPricesIncludeTax();
        cartManager         = createCartManager();
        totals              = cartManager.getTotals();
    } );

    test( 'total should have the Tax row', () => {
        expect( totals.findIndex( t => t.id === 'tax' ) ).toBeGreaterThan( -1 );
    } );
} );

describe( 'Displayed Totals - prices include tax - show prices including tax', () => {
    beforeAll( () => {
        yithPosSettings.tax                       = getTaxPricesIncludeTax();
        yithPosSettings.tax.showPriceIncludingTax = true;
        cartManager                               = createCartManager();
        totals                                    = cartManager.getTotals();
    } );

    test( 'total should not have the Tax row', () => {
        expect( totals.findIndex( t => t.id === 'tax' ) ).toBe( -1 );
    } );

    test( 'subtotal displayed should include taxes', () => {
        const subtotalLineIndex = totals.findIndex( t => t.id === 'subtotal' );
        expect( subtotalLineIndex ).toBeGreaterThan( -1 );
        expect( totals[ subtotalLineIndex ].price.toFixed( 2 ) ).toBe( '49.51' );
    } );

} );


describe( 'Displayed Totals - prices include tax - Big Cart - show prices excluding tax', () => {
    beforeAll( () => {
        yithPosSettings.tax = getTaxPricesIncludeTax();
        cartManager         = createCartManager( { items: 'big' } );
        totals              = cartManager.getTotals();
    } );

    test( 'total should have the Tax row', () => {
        expect( totals.findIndex( t => t.id === 'tax' ) ).toBeGreaterThan( -1 );
    } );
} );

describe( 'Displayed Totals - prices include tax - Big Cart - show prices including tax', () => {
    beforeAll( () => {
        yithPosSettings.tax                       = getTaxPricesIncludeTax();
        yithPosSettings.tax.showPriceIncludingTax = true;
        cartManager                               = createCartManager( { items: 'big' } );
        totals                                    = cartManager.getTotals();
    } );

    test( 'total should not have the Tax row', () => {
        expect( totals.findIndex( t => t.id === 'tax' ) ).toBe( -1 );
    } );

    test( 'subtotal displayed should include taxes', () => {
        const subtotalLineIndex = totals.findIndex( t => t.id === 'subtotal' );
        expect( subtotalLineIndex ).toBeGreaterThan( -1 );
        expect( totals[ subtotalLineIndex ].price.toFixed( 2 ) ).toBe( '170.57' );
    } );
} );

describe( 'Displayed Totals - prices include tax - Big Cart with shipping - show prices including tax', () => {
    beforeAll( () => {
        yithPosSettings.tax                       = getTaxPricesIncludeTax();
        yithPosSettings.tax.showPriceIncludingTax = true;
        cartManager                               = createCartManager( { items: 'big' } );
        shippingMethodId                          = cartManager.addShippingMethod( { method: "flat-rate", title: "Flat Rate", amount: 5 } );
        totals                                    = cartManager.getTotals();
    } );

    test( 'shipping displayed should include taxes', () => {
        const shippingLineIndex = totals.findIndex( t => t.key === shippingMethodId );
        expect( shippingLineIndex ).toBeGreaterThan( -1 );
        expect( totals[ shippingLineIndex ].price.toFixed( 2 ) ).toBe( '6.30' );
    } );
} );