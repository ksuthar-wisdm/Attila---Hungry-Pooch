/** @format */
import { CartManager }       from '../index';
import { createCartManager } from './helpers/cart';
import { getNoTax }          from './fixtures/tax';

let cartManager;
let totals;

describe( 'Displayed Totals - no tax', () => {
    beforeAll( () => {
        yithPosSettings.tax = getNoTax();
        cartManager         = createCartManager();
        totals              = cartManager.getTotals();
    } );

    test( 'total should not have the Tax row', () => {
        expect( totals.findIndex( t => t.id === 'tax' ) ).toBe( -1 );
    } );
} );