import { formatDate, getDateFormat, getDateTimeFormat, getTimeFormat } from '../date';

export function getOrderStatuses() {
	return yithPosSettings.wc.orderStatuses;
}

export function getOrderStatusName( status = '' ) {
	if ( status.indexOf( 'wc-' ) === 0 ) {
		status = status.substr( 3 );
	}
	const statuses       = getOrderStatuses();
	const prefixedStatus = 'wc-' + status;

	return prefixedStatus in statuses ? statuses[ prefixedStatus ] : status;
}

export function getOrderPaymentDetails( order ) {
	return order.pos_payment_details || [];
}

/**
 * Retrieve the order created date GMT.
 * @param order
 * @returns {Date}
 */
export function getOrderDateGMT( order ) {
	return new Date( order.date_created_gmt + 'Z' );
}

/**
 * Get the order formatted date.
 * Example: `20 Jun 2022`
 *
 * @param order
 * @returns {string}
 */
export function getOrderFormattedDate( order ) {
	return formatDate( getDateFormat(), getOrderDateGMT( order ) )
}

/**
 * Get the order formatted time.
 * Example: `10:35`
 *
 * @param order
 * @returns {string}
 */
export function getOrderFormattedTime( order ) {
	return formatDate( getTimeFormat(), getOrderDateGMT( order ) )
}

/**
 * Get the order formatted date time.
 * Example: `20 Jun 2022 10:35`
 *
 * @param order
 * @returns {string}
 */
export function getOrderFormattedDateTime( order ) {
	return formatDate( getDateTimeFormat(), getOrderDateGMT( order ) )
}