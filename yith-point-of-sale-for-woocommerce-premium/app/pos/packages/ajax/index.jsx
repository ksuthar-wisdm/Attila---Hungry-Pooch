/** global yithPosSettings */
import { addQueryArgs } from '@wordpress/url';

function ajaxCheckStatus( response ) {
    if ( response.status >= 200 && response.status < 300 ) {
        return response;
    }

    throw response;
}

function parseResponse( response ) {
    return response.json ? response.json() : response.text();
}

function ajax( data, url = yithPosSettings.ajaxUrl ) {
    url = addQueryArgs( url, data );
    return fetch( url ).then( ajaxCheckStatus ).then( parseResponse );
}
export default ajax;

