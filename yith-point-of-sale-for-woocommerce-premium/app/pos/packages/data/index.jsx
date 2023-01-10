import React            from 'react';
import { addQueryArgs } from '@wordpress/url';
import apiFetch         from '@wordpress/api-fetch';
import _                from 'lodash';


/**
 * Get the countries list from API
 * @returns {*}
 */
export function getCountriesByFetch() {
	return apiFetch( {
						 path: addQueryArgs( `wc/v3/data/countries` )
					 } )
}

export const getCountries = () => {
	return _.cloneDeep( yithPosSettings.wc.countries );
}

export const getCountryStates = ( countryCode ) => {
	const countries = getCountries();
	const country   = countries.find( _ => countryCode === _.code );
	if ( country ) {
		return country?.states ?? [];
	}

	return [];
};

/**
 * Parse html entities.
 *
 * @param str
 * @returns {*}
 */
export function parseHtmlEntities( str ) {
	return str.replace( /&#([0-9]{1,3});/gi, function ( match, numStr ) {
		var num = parseInt( numStr, 10 ); // read num as normal number
		return String.fromCharCode( num );
	} );
}

/**
 * Get the list of countries to show in a select.
 * @returns {object[]} Array of key-value objects.
 */
export const getCountriesOptions = () => {
	const countries = getCountries();
	return countries.map( _ => ( { key: _.code, label: parseHtmlEntities( _.name ) } ) );
};


/**
 * Return the list of States of a Country.
 *
 * @param countryCode
 * @returns {*[]}
 */
export const getStateOptionsByCountry = ( countryCode ) => {
	const states = getCountryStates( countryCode );

	return states.map( _ => ( { key: _.code, label: parseHtmlEntities( _.name ) } ) );
};

/**
 * Return the prefix of the POS Discount Coupons.
 *
 * @returns {string}
 * @since 2.0.0
 */
export const getPosDiscountCouponPrefix = () => '_yith_pos_discount_';

/**
 * Return true if the provided code is a POS Discount Coupon.
 *
 * @param code
 * @returns {boolean}
 * @since 2.0.0
 */
export const isPosDiscountCouponCode = ( code ) => typeof code === 'string' && !!code.startsWith( getPosDiscountCouponPrefix() );

/**
 * Retrieve an unique code for a new POS Discount Coupon.
 *
 * @returns {string}
 * @since 2.0.0
 */
export const getUniqueDiscountCouponCode = () => getPosDiscountCouponPrefix() + [yithPosSettings.register.id, yithPosSettings.user.id, Date.now()].join( '_' );