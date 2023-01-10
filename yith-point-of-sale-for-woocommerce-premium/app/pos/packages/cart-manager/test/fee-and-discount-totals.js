/** @format */
import { createCartManager } from './helpers/cart';

import taxDisabled                   from './fixtures/tax/no-tax';
import taxPricesIncludeTax           from './fixtures/tax/prices-include-tax';
import taxPricesNotIncludeTax        from './fixtures/tax/prices-not-include-tax';
import { createDiscount, createFee } from './helpers/fees-and-discounts';


let cartManager;

describe( 'Totals with Fees - no tax', () => {
    beforeAll( () => {
        yithPosSettings.tax = taxDisabled;
        cartManager         = createCartManager();
    } );

    // total = 49.52


    test( 'Fixed fee', () => {
        const fee    = createFee( 10 );
        const feeKey = cartManager.addFeeOrDiscount( fee );
        expect( cartManager.getTotal( 'total' ).toFixed( 2 ) ).toBe( '59.52' );
        cartManager.removeFeeOrDiscount( feeKey );
    } );

    test( 'Percentage fee', () => {
        const fee    = createFee( 10, true );
        const feeKey = cartManager.addFeeOrDiscount( fee );
        expect( cartManager.getTotal( 'total' ).toFixed( 2 ) ).toBe( '54.47' );
        cartManager.removeFeeOrDiscount( feeKey );
    } );

    test( 'Fixed and percentage fees', () => {
        const fixedFee         = createFee( 10 );
        const percentageFee    = createFee( 10, true );
        const fixedFeeKey      = cartManager.addFeeOrDiscount( fixedFee );
        const percentageFeeKey = cartManager.addFeeOrDiscount( percentageFee );

        expect( cartManager.getTotal( 'total' ).toFixed( 2 ) ).toBe( '65.47' );
        cartManager.removeFeeOrDiscount( fixedFeeKey );
        cartManager.removeFeeOrDiscount( percentageFeeKey );
    } );
} );

describe( 'Totals with Fees - prices include tax', () => {
    beforeAll( () => {
        yithPosSettings.tax = taxPricesIncludeTax;
        cartManager         = createCartManager();
    } );
    // total = 49.51

    test( 'Fixed fee', () => {
        const fee    = createFee( 10 );
        const feeKey = cartManager.addFeeOrDiscount( fee );
        expect( cartManager.getTotal( 'total' ).toFixed( 2 ) ).toBe( '59.51' );
        cartManager.removeFeeOrDiscount( feeKey );
    } );

    test( 'Percentage fee', () => {
        const fee    = createFee( 10, true );
        const feeKey = cartManager.addFeeOrDiscount( fee );
        expect( cartManager.getTotal( 'total' ).toFixed( 2 ) ).toBe( '54.46' );
        cartManager.removeFeeOrDiscount( feeKey );
    } );

    test( 'Fixed and percentage fees', () => {
        const fixedFee         = createFee( 10 );
        const percentageFee    = createFee( 10, true );
        const fixedFeeKey      = cartManager.addFeeOrDiscount( fixedFee );
        const percentageFeeKey = cartManager.addFeeOrDiscount( percentageFee );

        expect( cartManager.getTotal( 'total' ).toFixed( 2 ) ).toBe( '65.46' );
        cartManager.removeFeeOrDiscount( fixedFeeKey );
        cartManager.removeFeeOrDiscount( percentageFeeKey );
    } );
} );

describe( 'Totals with Fees - prices not include tax', () => {
    beforeAll( () => {
        yithPosSettings.tax = taxPricesNotIncludeTax;
        cartManager         = createCartManager();
    } );
    // total = 55.32

    test( 'Fixed fee', () => {
        const fee    = createFee( 10 );
        const feeKey = cartManager.addFeeOrDiscount( fee );
        expect( cartManager.getTotal( 'total' ).toFixed( 2 ) ).toBe( '65.32' );
        cartManager.removeFeeOrDiscount( feeKey );
    } );

    test( 'Percentage fee', () => {
        const fee    = createFee( 10, true );
        const feeKey = cartManager.addFeeOrDiscount( fee );
        expect( cartManager.getTotal( 'total' ).toFixed( 2 ) ).toBe( '60.85' );
        cartManager.removeFeeOrDiscount( feeKey );
    } );

    test( 'Fixed and percentage fees', () => {
        const fixedFee         = createFee( 10 );
        const percentageFee    = createFee( 10, true );
        const fixedFeeKey      = cartManager.addFeeOrDiscount( fixedFee );
        const percentageFeeKey = cartManager.addFeeOrDiscount( percentageFee );

        expect( cartManager.getTotal( 'total' ).toFixed( 2 ) ).toBe( '71.85' );
        cartManager.removeFeeOrDiscount( fixedFeeKey );
        cartManager.removeFeeOrDiscount( percentageFeeKey );
    } );
} );

describe( 'Totals with discounts - no tax', () => {
    beforeAll( () => {
        yithPosSettings.tax = taxDisabled;
        cartManager         = createCartManager();
    } );
    // total = 49.52

    test( 'Fixed discount', () => {
        const discount    = createDiscount( 10 );
        const discountKey = cartManager.addFeeOrDiscount( discount );
        expect( cartManager.getTotal( 'total' ).toFixed( 2 ) ).toBe( '39.52' );
        cartManager.removeFeeOrDiscount( discountKey );
    } );

    test( 'Percentage discount', () => {
        const discount    = createDiscount( 10, true );
        const discountKey = cartManager.addFeeOrDiscount( discount );
        expect( cartManager.getTotal( 'total' ).toFixed( 2 ) ).toBe( '44.57' );
        cartManager.removeFeeOrDiscount( discountKey );
    } );

    test( 'Fixed and percentage discounts', () => {
        const fixedDiscount         = createDiscount( 10 );
        const percentageDiscount    = createDiscount( 10, true );
        const fixedDiscountKey      = cartManager.addFeeOrDiscount( fixedDiscount );
        const percentageDiscountKey = cartManager.addFeeOrDiscount( percentageDiscount );

        expect( cartManager.getTotal( 'total' ).toFixed( 2 ) ).toBe( '35.57' );
        cartManager.removeFeeOrDiscount( fixedDiscountKey );
        cartManager.removeFeeOrDiscount( percentageDiscountKey );
    } );
} );

describe( 'Totals with discounts - prices include tax', () => {
    beforeAll( () => {
        yithPosSettings.tax = taxPricesIncludeTax;
        cartManager         = createCartManager();
    } );
    // total = 49.51

    test( 'Fixed discount', () => {
        const discount    = createDiscount( 10 );
        const discountKey = cartManager.addFeeOrDiscount( discount );
        expect( cartManager.getTotal( 'total' ).toFixed( 2 ) ).toBe( '39.51' );
        cartManager.removeFeeOrDiscount( discountKey );
    } );

    test( 'Percentage discount', () => {
        const discount    = createDiscount( 10, true );
        const discountKey = cartManager.addFeeOrDiscount( discount );
        expect( cartManager.getTotal( 'total' ).toFixed( 2 ) ).toBe( '44.56' );
        cartManager.removeFeeOrDiscount( discountKey );
    } );

    test( 'Fixed and percentage discounts', () => {
        const fixedDiscount         = createDiscount( 10 );
        const percentageDiscount    = createDiscount( 10, true );
        const fixedDiscountKey      = cartManager.addFeeOrDiscount( fixedDiscount );
        const percentageDiscountKey = cartManager.addFeeOrDiscount( percentageDiscount );

        expect( cartManager.getTotal( 'total' ).toFixed( 2 ) ).toBe( '35.56' );
        cartManager.removeFeeOrDiscount( fixedDiscountKey );
        cartManager.removeFeeOrDiscount( percentageDiscountKey );
    } );
} );

describe( 'Totals with discounts - prices not include tax', () => {
    beforeAll( () => {
        yithPosSettings.tax = taxPricesNotIncludeTax;
        cartManager         = createCartManager();
    } );
    // total = 55.32

    test( 'Fixed discount', () => {
        const discount    = createDiscount( 10 );
        const discountKey = cartManager.addFeeOrDiscount( discount );
        expect( cartManager.getTotal( 'total' ).toFixed( 2 ) ).toBe( '45.32' );
        cartManager.removeFeeOrDiscount( discountKey );
    } );

    test( 'Percentage discount', () => {
        const discount    = createDiscount( 10, true );
        const discountKey = cartManager.addFeeOrDiscount( discount );
        expect( cartManager.getTotal( 'total' ).toFixed( 2 ) ).toBe( '49.79' );
        cartManager.removeFeeOrDiscount( discountKey );
    } );

    test( 'Fixed and percentage discounts', () => {
        const fixedDiscount         = createDiscount( 10 );
        const percentageDiscount    = createDiscount( 10, true );
        const fixedDiscountKey      = cartManager.addFeeOrDiscount( fixedDiscount );
        const percentageDiscountKey = cartManager.addFeeOrDiscount( percentageDiscount );

        expect( cartManager.getTotal( 'total' ).toFixed( 2 ) ).toBe( '40.79' );
        cartManager.removeFeeOrDiscount( fixedDiscountKey );
        cartManager.removeFeeOrDiscount( percentageDiscountKey );
    } );
} );


describe( 'Totals with fees and discounts - no tax', () => {
    beforeAll( () => {
        yithPosSettings.tax = taxDisabled;
        cartManager         = createCartManager();
    } );
    // total = 49.52

    test( 'Fixed and percentage fees and discounts', () => {
        const fixedFee              = createFee( 10 );
        const percentageDiscount    = createDiscount( 15, true );
        const fixedDiscount         = createDiscount( 7 );
        const percentageFee         = createFee( 13, true );
        // IMPORTANT: the order of application is relevant!!!
        const fixedFeeKey           = cartManager.addFeeOrDiscount( fixedFee );
        const percentageDiscountKey = cartManager.addFeeOrDiscount( percentageDiscount );
        const fixedDiscountKey      = cartManager.addFeeOrDiscount( fixedDiscount );
        const percentageFeeKey      = cartManager.addFeeOrDiscount( percentageFee );

        expect( cartManager.getTotal( 'total' ).toFixed( 2 ) ).toBe( '49.26' );
        cartManager.removeFeeOrDiscount( fixedDiscountKey );
        cartManager.removeFeeOrDiscount( percentageDiscountKey );
        cartManager.removeFeeOrDiscount( fixedFeeKey );
        cartManager.removeFeeOrDiscount( percentageFeeKey );
    } );
} );