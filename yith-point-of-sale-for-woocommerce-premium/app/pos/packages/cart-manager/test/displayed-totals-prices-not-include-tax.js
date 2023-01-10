/** @format */
import { createCartManager }         from './helpers/cart';
import { getTaxPricesNotIncludeTax } from './fixtures/tax';

let cartManager;
let totals;
let shippingMethodId;

describe( 'Displayed Totals - prices not include tax - show prices excluding tax', () => {
    beforeAll( () => {
        yithPosSettings.tax = getTaxPricesNotIncludeTax();
        cartManager         = createCartManager();
        totals              = cartManager.getTotals();
    } );

    test( 'total should have the Tax row', () => {
        expect( totals.findIndex( t => t.id === 'tax' ) ).toBeGreaterThan( -1 );
    } );
} );

describe( 'Displayed Totals - prices not include tax - show prices including tax', () => {
    beforeAll( () => {
        yithPosSettings.tax                       = getTaxPricesNotIncludeTax();
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
        expect( totals[ subtotalLineIndex ].price.toFixed( 2 ) ).toBe( '55.32' );
    } );

} );


describe( 'Displayed Totals - prices not include tax - Big Cart - show prices excluding tax', () => {
    beforeAll( () => {
        yithPosSettings.tax = getTaxPricesNotIncludeTax();
        cartManager         = createCartManager( { items: 'big' } );
        totals              = cartManager.getTotals();
    } );

    test( 'total should have the Tax row', () => {
        expect( totals.findIndex( t => t.id === 'tax' ) ).toBeGreaterThan( -1 );
    } );
} );

describe( 'Displayed Totals - prices not include tax - Big Cart - show prices including tax', () => {
    beforeAll( () => {
        yithPosSettings.tax                       = getTaxPricesNotIncludeTax();
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
        expect( totals[ subtotalLineIndex ].price.toFixed( 2 ) ).toBe( '209.26' );
    } );
} );

describe( 'Displayed Totals - prices not include tax - Big Cart with shipping - show prices including tax', () => {
    beforeAll( () => {
        yithPosSettings.tax                       = getTaxPricesNotIncludeTax();
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