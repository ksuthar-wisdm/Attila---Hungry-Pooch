/** global yithPosSettings */
import { getCountries, parseHtmlEntities } from "../data";
import { formatAddress }                   from '../utils';

/**
 * Return the VAT code of customer.
 *
 * @param customer
 * @returns {string}
 */
export const getCustomerVAT = customer => {
	let vat = '';

	if ( 'meta_data' in customer ) {
		const vat_row = customer.meta_data.filter( ( meta ) => meta.key === 'billing_vat' );
		vat           = vat_row.length > 0 ? vat_row[ 0 ].value : vat;
	}

	return vat;
}

/**
 * Return the full  name of customer.
 *
 * @param customer
 * @returns {string}
 */
export const getCustomerFullName = customer => {
	let fullName = '';


	if ( 'first_name' in customer && 'last_name' in customer && ( customer.first_name.length + customer.last_name.length > 0 ) ) {
		fullName = `${customer.first_name} ${customer.last_name}`;
	}

	return fullName;
}

/**
 * Return the label with the full name of customer and the email for select options.
 *
 * @param customer
 * @returns {string}
 */
export const getCustomerSelectLabel = customer => {
	let selectLabel = '';

	if ( 'first_name' in customer && 'last_name' in customer && 'email' in customer ) {
		selectLabel = `${customer.first_name} ${customer.last_name} (${customer.email})`;
	}

	return selectLabel;
}

/**
 * Return the customer formatted address
 *
 * @param customer
 * @param type 'billing'|'shipping'
 * @returns {String}
 */
export const getFormattedAddress = ( customer, type = 'billing' ) => {

	let addressFormat = yithPosSettings.addressFormat;
	addressFormat     = addressFormat.replace( '{name}', '' );
	addressFormat     = addressFormat.replace( '{name_upper}', '' );
	addressFormat     = addressFormat.replace( '{first_name}', '' );
	addressFormat     = addressFormat.replace( '{first_name_upper}', '' );
	addressFormat     = addressFormat.replace( '{last_name}', '' );
	addressFormat     = addressFormat.replace( '{last_name_upper}', '' );
	addressFormat     = addressFormat.replace( '{company}', '' );
	addressFormat     = addressFormat.replace( '{company_upper}', '' );

	if ( type in customer ) {
		const data    = customer[ type ];
		addressFormat = formatAddress( data, { format: addressFormat } )
	}

	return addressFormat;
}