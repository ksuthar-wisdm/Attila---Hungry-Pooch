import React                      from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { createElement }          from '@wordpress/element';
import { getQuery }               from '@woocommerce/navigation';

function Controller( { container } ) {
	const location = useLocation();
	const query    = getQuery();
	//query.page     = 'yith_pos_panel';
	const path     = '/';

	console.log( { query } );

	return createElement( container, { location, path, query } );
}

export default Controller;

