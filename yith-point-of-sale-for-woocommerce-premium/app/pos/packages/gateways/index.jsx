/** global yithPosSettings */
import React from 'react';

import { applyFilters } from '@wordpress/hooks';

const DEFAULT_SELECTED_PAYMENT_GATEWAY_FILTER = 'yith_pos_default_selected_payment_gateway';

/**
 *
 * @returns {[]}
 */
export const getAllGateways = () => {
	return Object.values( yithPosSettings.wc.paymentGateways );
}

/**
 * Get gateways of current register
 *
 * @returns {[]}
 */
export const getFilteredGateways = () => {
	const gateways = getAllGateways();
	const allowed  = yithPosSettings.register.payment_methods;
	return gateways.filter( ( gateway ) => ( allowed.includes( gateway.id ) ) );
};

/**
 * Get an icon for a gateway.
 *
 * @param gatewayID
 * @returns {string}
 */
export const getGatewayIcon = ( gatewayID ) => {
	const defaultIcon = 'payment-methods';

	const icons = {
		bacs                     : 'bank',
		paypal                   : 'paypal',
		cheque                   : 'bank-check',
		cod                      : 'money-truck',
		yith_pos_cash_gateway    : 'cash',
		yith_pos_chip_pin_gateway: 'accounting'
	};

	return icons[ gatewayID ] ?? defaultIcon;
};


/**
 * Return the array with the options to show the gateway in a select.
 *
 * @returns {[]}
 */
export const getFilteredGatewaysOptions = () => {
	const gateways = getFilteredGateways();

	return gateways.map( _ => ( { key: _.id, label: _.title, icon: getGatewayIcon( _.id ) } ) )
};

/**
 * Return the default gateway.
 *
 * @returns {string}
 */
export const getDefaultGatewaysOption = () => {
	const defaultSelected  = applyFilters( DEFAULT_SELECTED_PAYMENT_GATEWAY_FILTER, 'yith_pos_cash_gateway' );
	const filteredGateways = getFilteredGatewaysOptions();

	if ( filteredGateways.length > 0 ) {
		const defaultPayment = filteredGateways.find( ( gateway ) => gateway.key === defaultSelected );
		return !defaultPayment ? filteredGateways[ 0 ].key : defaultSelected;
	}

	return '';
};

export const getPaymentMethodTitle = ( id = '' ) => {
	const gateways = yithPosSettings.wc.paymentGatewaysIdTitle;
	return id in gateways ? gateways[ id ] : id;
};