import { dateI18n } from '@wordpress/date';


export function getDateFormat() {
	return yithPosSettings.dateFormat;
}

export function getTimeFormat() {
	return yithPosSettings.timeFormat;
}

export function getGmtOffset() {
	return parseInt( yithPosSettings.gmtOffset );
}

export function getDateTimeFormat() {
	return getDateFormat() + ' ' + getTimeFormat();
}

/**
 * Retrieve a date from a string.
 * @param date
 * @param gmt
 * @returns {Date}
 */
export function getDateFromString( date, gmt = true ) {
	if ( typeof date === 'string' ) {
		// support for iOS and macOS devices
		date = date.replace( /-/g, '/' );
		if ( gmt ) {
			date = date + ' GMT';
		}
		date = new Date( date );
	}

	return date;
}

export function formatTimestamp( timestamp, gmt = true, format = 'Y-m-d H:i:s' ) {
	const date = new Date( timestamp * 1000 );

	return dateI18n( format, date, gmt );
}

/*
 * TODO:
 *  to check, since it could cause timezone issues in combination with getDateFromString.
 *  To test: PC timezone -> +2; WP timezone -> 0. By using formatDate, the result date includes the +2 offset and this cause errors with dates.
 *  It was used in RegisterStats.queryArgs.after & in RegisterManager.retrieveRegisterSessionOrder:queryArgs.after to retrieve the date (from an UTC date) including the WP timezone
 */
export function formatDate( format, date = new Date(), timezone ) {
	date = getDateFromString( date );
	return dateI18n( format, date, timezone );
}
