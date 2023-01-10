import React, { useEffect, useRef, useState } from 'react';
import classNames                             from 'classnames';
import PropTypes                              from 'prop-types';
import { noop }                               from 'lodash';

import { __ }           from '@wordpress/i18n';
import apiFetch         from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';

import { getCustomerSelectLabel } from '../../packages/customers';
import Input                      from '../../packages/components/input';

export default function CustomerSelector( { onSelect, focusOnMount, notFoundRender } ) {
	const [customers, setCustomers] = useState( [] );
	const [search, setSearch]       = useState( '' );
	const [isLoading, setIsLoading] = useState( false );
	const isValidSearch             = search.length >= 3;
	const searchInputRef            = useRef();

	useEffect( () => {
		let timeout = false;
		if ( search.length >= 3 ) {
			setIsLoading( true );

			const query = {
				per_page: 10,
				search  : search,
				role    : 'all'
			};

			timeout = setTimeout(
				() => {
					apiFetch( { path: addQueryArgs( 'wc/v3/customers', query ) } )
						.then( loadedCustomers => {
							setCustomers( loadedCustomers ?? [] );
							setIsLoading( false );
						} );
				},
				200
			)

		} else {
			setIsLoading( false );
			setCustomers( [] );
		}

		return () => {
			!!timeout && clearTimeout( timeout );
		}
	}, [search] );

	useEffect( () => {
		if ( focusOnMount && searchInputRef?.current ) {
			searchInputRef?.current.focus();
		}
	}, [] );

	return <div className="customer-selector">
		<Input type="text" className="customer-selector__search customer-search"
			onChange={_ => setSearch( _ )}
			value={search}
			placeholder={__( 'Search for a customer...', 'yith-point-of-sale-for-woocommerce' )}
			icon="search"
			ref={searchInputRef}
		/>

		{!isValidSearch && <div className="customer-selector__message">{__( 'Please enter 3 or more characters', 'yith-point-of-sale-for-woocommerce' )}</div>}

		{!!customers.length &&
		 <div className={classNames( 'customer-selector__results', { 'is-loading': isLoading } )}>
			 {customers.map( ( customer ) => {
				 let customerLabel = getCustomerSelectLabel( customer );
				 const regExp      = new RegExp( search, 'gi' );
				 customerLabel     = customerLabel.replace( regExp, '<strong>' + search + '</strong>' );

				 return <div key={customer.id}
					 className="customer-selector__result"
					 onClick={() => onSelect( customer )}>
					 <img className="customer-selector__result__image" src={customer.avatar_url}/>
					 <span className="customer-selector__result__name" dangerouslySetInnerHTML={{ __html: customerLabel }}/>
				 </div>
			 } )}
		 </div>
		}

		{isValidSearch && !isLoading && !customers.length &&
		 <>
			 <div className="customer-selector__message customer-selector__message--not-found">{__( 'User not found.', 'yith-point-of-sale-for-woocommerce' )}</div>
			 {notFoundRender()}
		 </>
		}
	</div>
}

CustomerSelector.propTypes = {
	onSelect      : PropTypes.func,
	notFoundRender: PropTypes.func,
	focusOnMount  : PropTypes.bool
}

CustomerSelector.defaultProps = {
	onSelect      : noop,
	notFoundRender: noop,
	focusOnMount  : false
}