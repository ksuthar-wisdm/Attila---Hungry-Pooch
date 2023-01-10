import { calcTax }     from '../taxes';
import _               from 'lodash';
import { __, sprintf } from '@wordpress/i18n';

/** global yithPosSettings */


function number_format( number, decimals, decPoint, thousandsSep ) {
	number   = ( number + '' ).replace( /[^0-9+\-Ee.]/g, '' );
	var n    = !isFinite( +number ) ? 0 : +number;
	var prec = !isFinite( +decimals ) ? 0 : Math.abs( decimals );
	var sep  = ( typeof thousandsSep === 'undefined' ) ? ',' : thousandsSep;
	var dec  = ( typeof decPoint === 'undefined' ) ? '.' : decPoint;
	var s    = '';

	var toFixedFix = function ( n, prec ) {
		if ( ( '' + n ).indexOf( 'e' ) === -1 ) {
			return +( Math.round( n + 'e+' + prec ) + 'e-' + prec );
		} else {
			var arr = ( '' + n ).split( 'e' );
			var sig = '';
			if ( +arr[ 1 ] + prec > 0 ) {
				sig = '+';
			}
			return ( +( Math.round( +arr[ 0 ] + 'e' + sig + ( +arr[ 1 ] + prec ) ) + 'e-' + prec ) ).toFixed( prec );
		}
	};

	// @todo: for IE parseFloat(0.55).toFixed(0) = 0;
	s = ( prec ? toFixedFix( n, prec ).toString() : '' + Math.round( n ) ).split( '.' );
	if ( s[ 0 ].length > 3 ) {
		s[ 0 ] = s[ 0 ].replace( /\B(?=(?:\d{3})+(?!\d))/g, sep );
	}
	if ( ( s[ 1 ] || '' ).length < prec ) {
		s[ 1 ] = s[ 1 ] || '';
		s[ 1 ] += new Array( prec - s[ 1 ].length + 1 ).join( '0' );
	}

	return s.join( dec );
}

/**
 * Formats a number using site's current locale
 *
 * @see http://locutus.io/php/strings/number_format/
 * @param {Number|String} number number to format
 * @param {int|null} [precision=null] optional decimal precision
 * @returns {?String} A formatted string.
 */
export function numberFormat( number, precision = null ) {
	if ( 'number' !== typeof number ) {
		number = parseFloat( number );
	}

	if ( isNaN( number ) ) {
		return '';
	}

	const decimalSeparator  = yithPosSettings.wc.currency.decimal_separator;
	const thousandSeparator = yithPosSettings.wc.currency.thousand_separator;
	precision               = parseInt( precision );

	if ( isNaN( precision ) ) {
		const [, decimals] = number.toString().split( '.' );
		precision          = decimals ? decimals.length : 0;
	}

	return number_format( number, precision, decimalSeparator, thousandSeparator );
}


/**
 * Unformats a number using site's current locale
 *
 * @param {Number|String} number number to format
 * @returns {Number} unformat number
 */
export function reverseNumberFormat( number ) {

	const decimalSeparator  = yithPosSettings.wc.currency.decimal_separator;
	const thousandSeparator = yithPosSettings.wc.currency.thousand_separator;

	let newNumber = number.toString().replace( new RegExp( '\\' + thousandSeparator, 'g' ), '' );
	newNumber     = newNumber.replace( new RegExp( '\\' + decimalSeparator, 'g' ), '.' );

	return newNumber;
}


/**
 * Formats money with a given currency code. Uses site's currency settings for formatting.
 *
 * @param   {Number|String} number number to format
 * @param   {String}        currencySymbol currency code e.g. '$'
 * @returns {?String} A formatted string.
 */
export function formatCurrency( number, currencySymbol = false ) {
	// default to wcSettings (and then to $) if currency symbol is not passed in
	if ( !currencySymbol ) {
		currencySymbol = yithPosSettings.wc.currency.symbol;
	}

	const precision       = yithPosSettings.wc.currency.precision;
	const formattedNumber = numberFormat( number, precision );
	const priceFormat     = yithPosSettings.wc.currency.price_format;

	if ( '' === formattedNumber ) {
		return formattedNumber;
	}

	return sprintf( priceFormat, currencySymbol, formattedNumber );
}

/**
 * Format a min/max price range to display.
 * @param {number} minPrice The min price, if set.
 * @param {number} maxPrice The max price, if set.
 */
export const formatPriceRange = ( minPrice, maxPrice ) => {
	if ( Number.isFinite( minPrice ) && Number.isFinite( maxPrice ) ) {
		return sprintf(
			/* translators: %s min price, %s max price */
			'%s - %s',
			formatCurrency( minPrice ),
			formatCurrency( maxPrice )
		);
	}

	if ( Number.isFinite( minPrice ) ) {
		return sprintf(
			/* translators: %s min price */
			__( 'From %s', 'yith-point-of-sale-for-woocommerce' ),
			formatCurrency( minPrice )
		);
	}

	return sprintf(
		/* translators: %s max price */
		__( 'Up to %s', 'yith-point-of-sale-for-woocommerce' ),
		formatCurrency( maxPrice )
	);
};

/**
 * Format a sale price
 * @param {number} regularPrice The regular price
 * @param {number} salePrice The sale price
 */
export const formatSalePrice = ( regularPrice, salePrice ) => {

	return sprintf(
		/* translators: %s min price, %s max price */
		'<del>%s</del><ins>%s</ins>',
		formatCurrency( regularPrice ),
		formatCurrency( salePrice )
	);
};

export function priceValidation( price ) {
	const decimalPoint = yithPosSettings.wc.currency.decimal_separator;

	const regex = new RegExp( '[^\-0-9\%\\' + decimalPoint + ']+', 'gi' );

	let newprice      = price.replace( regex, '' );
	let error_message = '';
	if ( price !== newprice ) {
		error_message = 'format-price';
	} else if ( ( price * 1 ) < 0 ) {
		error_message = 'negative-price';
	}

	return error_message;
}

export function formatPrice( number ) {
	const precision = yithPosSettings.wc.currency.precision;
	return numberFormat( number, precision );
}

export function roundPrice( number, precision = false, mode = 'half-up' ) {
	if ( 'number' !== typeof number ) {
		number = parseFloat( number );
	}

	if ( isNaN( number ) ) {
		return 0;
	}

	if ( precision === false ) {
		precision = yithPosSettings.wc.currency.precision;
	}

	if ( 'half-down' === mode ){
		const pw = Math.pow( 10, precision );
		number =  pw * number;
		number = - Math.round( - number );
		number = number / pw;
	}

	return parseFloat( number.toFixed( precision ) );
}

export function roundIntPrice( number, mode = 'half-up' ) {
	return roundPrice( number, 0, mode );
}

export function roundPriceWithBetterPrecision( number, improve = 4 ) {
	const precision = yithPosSettings.wc.currency.precision + improve;

	return roundPrice( number, precision );
}

export function getCent( precision = false ) {
	if ( precision === false ) {
		precision = yithPosSettings.wc.currency.precision;
	}
	return 1 / ( Math.pow( 10, precision ) );
}

export function getCentWithBetterPrecision( improve = 2 ) {
	return roundPriceWithBetterPrecision( getCent(), improve );
}

export function addNumberPrecision( value, round = true ) {
	const centPrecision = Math.pow( 10, yithPosSettings.wc.currency.precision );
	value               = parseFloat( value ) * centPrecision;

	return round ? roundPrice( value, 2 ) : value;
}

export function removeNumberPrecision( value ) {
	const centPrecision = Math.pow( 10, yithPosSettings.wc.currency.precision );
	return value / centPrecision;
}

export function removeNumberPrecisionDeep( values ) {
	if ( typeof values !== 'object' ) {
		return removeNumberPrecision( values );
	}

	let newValues = {};

	Object.keys( values ).forEach( ( key ) => {
		const value = values[ key ];
		let newValue;
		if ( typeof values !== 'object' ) {
			newValue = removeNumberPrecision( value );
		} else {
			newValue = removeNumberPrecisionDeep( value );
		}
		newValues[ key ] = newValue;
	} );

	return newValues;
}

export function absInt( value ) {
	return Math.abs( parseInt( value ) );
}

export function arraySum( values ) {
	if ( typeof values !== 'object' ) {
		return parseFloat( values );
	}

	if ( values instanceof Map ) {
		values = Object.fromEntries( values.entries() );
	}

	const reduce = ( acc, value ) => {
		acc += parseFloat( value );
		return acc;
	};
	return Object.values( values ).reduce( reduce, 0 );
}

export const getPaymentPresets = ( price = 0, limit = false ) => {


	const currencies   = require( 'world-currencies' );
	const currencyCode = yithPosSettings.wc.currency.code;
	const precision    = yithPosSettings.wc.currency.precision;
	const currency     = currencyCode in currencies ? currencies[ currencyCode ] : '';
	if ( currency === '' || price === 0 ) {
		return {};
	}

	const majorSymbol = currency.units.major.symbol.toLowerCase();
	const minorSymbol = currency.units.minor.symbol.toLowerCase();
	const step        = parseFloat( currency.units.minor.majorValue );
	let arrayUnits    = [];

	const currencyUnits = [...currency.coins.frequent, ...currency.banknotes.frequent];


	//coins
	currencyUnits.forEach( ( unit ) => {
		unit = unit.toLowerCase();
		let unitValue;

		if ( majorSymbol && unit.indexOf( majorSymbol ) >= 0 ) {
			unitValue = unit.replace( majorSymbol, '' );
			unitValue = parseFloat( unitValue );
		}

		if ( minorSymbol && unit.indexOf( minorSymbol ) >= 0 ) {
			unitValue = unit.replace( minorSymbol, '' );
			unitValue = parseFloat( unitValue ) * step;
		}

		arrayUnits.push( unitValue );
	} );

	arrayUnits.sort( ( a, b ) => ( a > b ) ? 1 : -1 );

	let presets = [parseFloat( price.toFixed( precision ) )];

	let upper   = arrayUnits.filter( ( unit ) => price <= unit );
	const lower = arrayUnits.filter( ( unit ) => price > unit );
	lower.sort( ( a, b ) => ( a < b ) ? 1 : -1 );

	presets        = [...presets, ...upper];
	const newLower = lower.splice( 0 );

	newLower.forEach( ( currentLower ) => {

		if ( presets.length > 7 ) {
			return;
		}
		const decimal = price - Math.floor( price );

		const rest       = ( price % currentLower ) / 100;
		const isMultiple = parseFloat( rest.toFixed( precision ) );

		if ( ( decimal > 0 && decimal < currentLower ) || isMultiple !== 0 ) {
			const multiply   = parseInt( price / currentLower ) + 1;
			const multilower = multiply * currentLower;
			presets.push( parseFloat( multilower.toFixed( precision ) ) );
			presets = _.union( presets );
		}
	} );

	presets = _.union( presets );
	presets.sort( ( a, b ) => ( a > b ) ? 1 : -1 );

	if ( limit ) {
		presets.splice( limit );
	}

	return presets;
}

let id = 0;

export const initUniqueID = function ( _id ) {
	id = _id;
};

export const uniqueID = function () {
	id++;
	return id;
};

export function parseStringPrice( price ) {
	return price.toString()
		.replace( yithPosSettings.wc.currency.decimal_separator, '.' );
}

export function floatSum( ...args ) {
	return args.reduce( ( tot, num ) => tot + parseFloat( num ), 0 );
}
