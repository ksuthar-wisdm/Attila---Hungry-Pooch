/* global yithPosSettings */
import { __ } from '@wordpress/i18n';

const defaults = {
    id                : 0,
    date_created      : '',
    date_created_gmt  : '',
    date_modified     : '',
    date_modified_gmt : '',
    email             : '',
    first_name        : __( 'Guest', 'yith-point-of-sale-for-woocommerce' ),
    last_name         : '',
    role              : '',
    username          : '',
    billing           : {},
    shipping          : {},
    is_paying_customer: false,
    avatar_url        : yithPosSettings.assetsUrl + '/images/default_avatar.svg',
    meta_data         : [],
    /* Added by WisdmLabs */
    points            : 0
    /* Added by WisdmLabs */
};

const Customer = function ( params = {} ) {
    return Object.assign( {}, defaults, params );
};

export default Customer;