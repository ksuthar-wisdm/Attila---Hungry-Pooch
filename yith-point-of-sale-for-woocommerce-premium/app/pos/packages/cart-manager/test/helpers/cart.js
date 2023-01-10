import { CartManager }         from '../../index';
import { createSimpleProduct } from './products';
import cartItems from '../fixtures/carts/cart-items';

const defaultParams = {
    tax  : false, // get the default settings
    items: 'default' // load default cart-items from fixtures
};

/**
 *
 * @param params
 * @returns {CartManager}
 */
export const createCartManager = function ( params = {} ) {
    params           = Object.assign( {}, defaultParams, params );
    const currentTax = yithPosSettings.tax;
    if ( params.tax ) {
        yithPosSettings.tax = params.tax;
    }

    if ( typeof params.items !== 'object' ) {
        params.items = getCartItemsFixture( params.items );
    }

    const cartManager = new CartManager();

    params.items.forEach( ( item ) => {
        const product = createSimpleProduct( item.product );
        cartManager.addCartItem( CartManager.getItemProductData( product ), item.qty );
    } );

    if ( params.tax ) {
        yithPosSettings.tax = currentTax;
    }

    return cartManager;
};

export const createCartItem = function ( params = {} ) {
    const product = createSimpleProduct( params );
    return CartManager.getItemProductData( product );
};

export const getCartItemsFixture = ( type ) => {
    const items =  type in cartItems !== 'undefined' ? cartItems[ type ] : cartItems[ 'default' ];
    return items;
};