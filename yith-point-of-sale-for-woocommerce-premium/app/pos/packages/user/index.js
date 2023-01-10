import { __ } from '@wordpress/i18n';

const { user, errorMessages } = yithPosSettings;
const { posCaps }             = user;

export function userCan( capability ) {
	return posCaps[ capability ] ?? false;
}

export function userCanError( capability ) {
	if ( userCan( capability ) ) {
		return false;
	} else {
		return errorMessages[ capability ] ?? __( 'Error: You are not able to do this.', 'yith-point-of-sale-for-woocommerce' );
	}
}