/** global yithPosSettings */
import React                   from 'react';
import { addQueryArgs }        from '@wordpress/url';
import apiFetch                from '@wordpress/api-fetch';

import _                   from 'lodash';
import storage             from '../storage';


/**
 * Get the shipping methods list from API
 * @returns {*}
 */
export function getAllShippingMethodsByFetch() {
    return apiFetch( {
        path: addQueryArgs( "wc/v3/shipping_methods" )
    } )
};



/**
 * Get an icon for a shipping method.
 *
 * @param shippingMethod
 * @returns {string|*}
 */
export const getShippingIcon = ( shippingMethod ) => {
    const defaultIcon = 'shipping-van';

    const icons = {
        flat_rate    : 'flat-rate',
        free_shipping: 'free-shipping',
        local_pickup : 'local-pick-up',
    };

    if ( shippingMethod in icons ) {
        return icons[ shippingMethod ];
    }

    return defaultIcon;
};

/**
 * Get all shipping methods
 *
 * @returns {Promise<*>}
 */
export const getAllShippingMethods = async () => {
    let shippingMethods = storage.get( 'shippingMethods', {} );

    if( _.isEmpty(shippingMethods)){
        shippingMethods = await getAllShippingMethodsByFetch();
        storage.set( 'shippingMethods', shippingMethods );
    }

    return shippingMethods;
};



/**
 * Return the array with the options to show the gateway in a select.
 *
 * @returns {Promise<[]>}
 */
export const getShippingMethodsOptions = async () => {
    const shippingMethods          = await getAllShippingMethods();
    let options = [];
    shippingMethods.forEach( ( shipping ) => {
        options.push( { key: shipping.id, label: shipping.title, icon: getShippingIcon(shipping.id) } );
    });

    return options;
};