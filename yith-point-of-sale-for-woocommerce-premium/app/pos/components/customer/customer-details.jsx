import { __ }              from '@wordpress/i18n';
import React, { useState } from 'react';
import PropTypes           from 'prop-types';
import { noop }            from 'lodash';
import apiFetch            from '@wordpress/api-fetch';
import { addQueryArgs }    from '@wordpress/url';


import CustomerSelector           from './customer-selector';
import { getCustomerSelectLabel } from '../../packages/customers';
import CustomerInfoBox            from './customer-info-box';
import Button                     from '../../packages/components/button';

function CustomerDetails( { customer: currentCustomer, onClear, onSelect, onConfirm, mode, onEdit, notFoundRender, currentCustomerFooterRender } ) {
	const [customer, setCustomer]   = useState( currentCustomer );
	const [isLoading, setIsLoading] = useState( false );
	const isGuest                   = customer.id === 0;
	const label                     = getCustomerSelectLabel( customer );

	const handleSelect = selectedCustomer => {
		setCustomer( selectedCustomer );
		onSelect( selectedCustomer );
	}

	return <>
		{
			isGuest ?
			<CustomerSelector onSelect={handleSelect} focusOnMount notFoundRender={notFoundRender}/> :
			<>
				<div className="current-customer">
					{!!currentCustomer.avatar_url && <img className="avatar" src={currentCustomer.avatar_url}/>}
					<div className="name">{label}</div>
					<div className="remove" onClick={onClear}>
						<i className="yith-pos-icon-clear"/>
						{__( 'Remove', 'yith-point-of-sale-for-woocommerce' )}
					</div>
				</div>
				<CustomerInfoBox customer={customer} onClick={() => onEdit( customer )}/>
				{'load' === mode &&
					<Button
						className={isLoading ? 'is-loading' : ''}
						variant="primary"
						fullWidth
						/* Modified by WisdmLabs */
						onClick={ () => {
							setIsLoading( true );
							apiFetch( { path: addQueryArgs( 'wdm_yith_customisation/v1/points', { user_id: customer.id } ) } )
								.then( points => {
									customer.points = points;
									setCustomer( customer );
									onConfirm( customer );
									setIsLoading( false );
								} )
								.catch( error => {
									setIsLoading( false );
									alert( error.message );
								} );
						} } /* Modified by WisdmLabs */>
						{__( 'Use this customer profile', 'yith-point-of-sale-for-woocommerce' )}
					</Button>
				}
				{currentCustomerFooterRender()}
			</>
		}
	</>
}

CustomerDetails.propTypes = {
	customer                   : PropTypes.object,
	onClear                    : PropTypes.func,
	onSelect                   : PropTypes.func,
	onConfirm                  : PropTypes.func,
	onEdit                     : PropTypes.func,
	notFoundRender             : PropTypes.func,
	currentCustomerFooterRender: PropTypes.func,
	mode                       : PropTypes.oneOf( ['load', 'edit'] )
}

CustomerDetails.defaultProps = {
	onClear                    : noop,
	onSelect                   : noop,
	onConfirm                  : noop,
	onEdit                     : noop,
	notFoundRender             : noop,
	currentCustomerFooterRender: noop
}

export default CustomerDetails;