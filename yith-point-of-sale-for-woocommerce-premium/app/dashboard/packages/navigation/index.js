import { getPath, getQuery } from '@woocommerce/navigation';
import { removeQueryArgs, addQueryArgs }   from '@wordpress/url';


export function removeQueryArgsFromPath( args = [], path = getPath(), currentQuery = getQuery() ) {
    if ( '/' !== path ) {
        currentQuery.path = path;
    }
    const currentPath = addQueryArgs( '', currentQuery );
    return removeQueryArgs( currentPath, args );
}