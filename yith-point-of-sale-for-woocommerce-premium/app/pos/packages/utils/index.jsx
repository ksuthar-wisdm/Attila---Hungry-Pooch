import { parseHtmlEntities } from '../data';
import { Fragment }          from 'react';

export function objectMap( object, callback ) {
	object = Object.assign( {}, object );
	Object.keys( object ).map( function ( key ) {
		object[ key ] = callback( object[ key ] );
	} );
	return object;
}

export function mapMap( object, callback ) {
	object = new Map( object );
	object.forEach( ( value, key, map ) => {
		object.set( key, callback( value ) );
	} );
	return object;
}

export function reverseOrderedMap( map ) {
	let newMap = new Map();
	let keys   = Array.from( map.keys() );
	let values = Array.from( map.values() );

	keys   = keys.reverse();
	values = values.reverse();

	for ( let i in keys ) {
		const key   = keys[ i ];
		const value = values[ i ];
		newMap.set( key, value );
	}

	return newMap;
}

/**
 * Format address
 * @param data
 * @param options
 * @returns {String}
 * @since 1.6.0
 */
export function formatAddress( data = {}, options = {} ) {
	const defaults = {
		format         : yithPosSettings.addressFormat,
		allowBreakLines: false
	};

	options = { ...defaults, ...options };

	let address = options.format;

	if ( !options.allowBreakLines ) {
		address = address.replace( new RegExp( '\n', 'gi' ), ' ' );
	}

	address = address.replace( '{name}', '{first_name} {last_name}' );

	address = address.replace( '{first_name}', 'first_name' in data ? data.first_name : '' );
	address = address.replace( '{first_name_upper}', 'first_name' in data ? data.first_name.toUpperCase() : '' );
	address = address.replace( '{last_name}', 'last_name' in data ? data.last_name : '' );
	address = address.replace( '{last_name_upper}', 'last_name' in data ? data.last_name.toUpperCase() : '' );
	address = address.replace( '{company}', 'company' in data ? data.company : '' );
	address = address.replace( '{company_upper}', 'company' in data ? data.company.toUpperCase() : '' );

	address = address.replace( '{postcode}', 'postcode' in data ? data.postcode : '' );
	address = address.replace( '{postcode_upper}', 'postcode' in data ? data.postcode.toUpperCase() : '' );
	address = address.replace( '{address_1}', 'address_1' in data ? data.address_1 : '' );
	address = address.replace( '{address_1_upper}', 'address_1' in data ? data.address_1.toUpperCase() : '' );
	address = address.replace( '{address_2}', 'address_2' in data ? data.address_2 : '' );
	address = address.replace( '{address_2_upper}', 'address_2' in data ? data.address_2.toUpperCase() : '' );
	address = address.replace( '{city}', 'city' in data ? data.city : '' );
	address = address.replace( '{city_upper}', 'city_upper' in data ? data.city.toUpperCase() : '' );
	address = address.replace( '{state}', 'state' in data ? data.state : '' );
	address = address.replace( '{state_upper}', 'state_upper' in data ? data.state.toUpperCase() : '' );
	address = address.replace( '{state_code}', 'state_code' in data ? data.state : '' );
	address = address.replace( '{phone}', 'phone' in data ? data.phone : '' );

	if ( 'country' in data ) {
		const countries = yithPosSettings.wc.countries;
		if ( countries.length > 0 ) {
			const selectedCountry = countries.filter( ( country ) => data.country === country.code );
			if ( selectedCountry.length > 0 ) {

				const selectedState = selectedCountry[ 0 ].states.filter( ( state ) => data.state === state.code );
				const stateName     = selectedState.length > 0 ? parseHtmlEntities( selectedState[ 0 ].name ) : '';
				address             = address.replace( '{state}', stateName );
				address             = address.replace( '{state_upper}', stateName.toUpperCase() );
				const countryName   = selectedCountry.length > 0 ? parseHtmlEntities( selectedCountry[ 0 ].name ) : '';
				address             = address.replace( '{country}', countryName );
				address             = address.replace( '{country_upper}', countryName.toUpperCase() );
			} else {
				address = address.replace( '{country}', '' );
				address = address.replace( '{country_upper}', '' );
				address = address.replace( '{state}', '' );
				address = address.replace( '{state_upper}', '' );
			}
		}
	} else {
		address = address.replace( '{country}', '' );
		address = address.replace( '{country_upper}', '' );
		address = address.replace( '{state}', '' );
		address = address.replace( '{state_upper}', '' );
	}

	return address.trim();
}

export const isValidEmail = email => {
	const pattern = new RegExp( /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i );
	return pattern.test( email );
}

/**
 * Split a string into an array with sprintf-style tokens as the delimiter.
 *
 * Including the entire match as a capture group causes the tokens to be included in the array
 * as separate items instead of being removed.
 *
 * This allows translated strings, which may contain tokens in different positions than they have
 * in English, to be manipulated, modified, and included as an array of child elements in a
 * React template.
 *
 * See also arrayTokenReplace
 *
 * Example:
 *
 *   tokenSplit( 'I accuse %1$s in the %2$s with the %3$s!' )
 *
 *   becomes
 *
 *   [ 'I accuse ', '%1$s', ' in the ', '%2$s', ' with the ', '%3$s', '!' ]
 *
 * @param {string} string
 *
 * @return {Array} The split string.
 */
export function tokenSplit( string ) {
	const regex = /(%[1-9]?\$?s)/;

	return string.split( regex );
}

/**
 * Replace array items that are sprintf-style tokens with argument values.
 *
 * This allows tokens to be replaced with complex objects such as React elements, instead of just strings.
 * This way, for example, a translation can include both plain strings and HTML and be inserted as an array
 * of child elements into a React template without having to use RawHTML.
 *
 * See also tokenSplit
 *
 * Example:
 *
 *   arrayTokenReplace(
 *       [ 'I accuse ', '%1$s', ' in the ', '%2$s', ' with the ', '%3$s', '!' ],
 *       [ 'Professor Plum', 'Conservatory', 'Wrench' ]
 *   )
 *
 *   becomes
 *
 *   [ 'I accuse ', 'Professor Plum', ' in the ', 'Conservatory', ' with the ', 'Wrench', '!' ]
 *
 * @param {Array} source
 * @param {Array} args
 *
 * @return {Array} Array with token items replaced.
 */
export function arrayTokenReplace( source, args ) {
	let specificArgIndex,
		nextArgIndex = 0;

	return source.flatMap( ( value ) => {
		const regex = /^%([1-9])?\$?s$/;
		const match = value.match( regex );

		if ( Array.isArray( match ) ) {
			if ( match.length > 1 && 'undefined' !== typeof match[ 1 ] ) {
				specificArgIndex = Number( match[ 1 ] ) - 1;

				if ( 'undefined' !== typeof args[ specificArgIndex ] ) {
					value = args[ specificArgIndex ];
				}
			} else {
				value = args[ nextArgIndex ];

				nextArgIndex++;
			}
		}

		return value;
	} );
}

/**
 * Returns a formatted string. If an error occurs in applying the format, the
 * original format string is returned.
 *
 * @param {string} format The format of the string to generate.
 * @param {...*}   args   Arguments to apply to the format.
 *
 * @see https://www.npmjs.com/package/sprintf-js
 *
 * @return {string} The formatted string.
 */

/**
 * Returns an array to be printed through React containing the formatted "string" result.
 * Similar to WP sprintf, but it allows also to use React components as arguments.
 *
 * @param {string} format The format of the string to generate.
 * @param {...*}   args   Arguments to apply to the format.
 * @returns {Array} array of parts of the result string.
 */
export function tokenPrintf( format, ...args ) {
	return arrayTokenReplace( tokenSplit( format ), args ).map( ( el, idx ) => <Fragment key={idx}>{el}</Fragment> );
}