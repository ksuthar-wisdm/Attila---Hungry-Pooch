import { useEffect, useState } from 'react';

import { __ }           from '@wordpress/i18n';
import apiFetch         from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { applyFilters } from '@wordpress/hooks';

import ControlledForm                                             from '../../common/controlled-form';
import { loggerStore }                                            from '../../logger';
import { getCustomerDataFromValues, getFields, getInitialValues } from './utils';

export default function CustomerForm( { customer, onSave } ) {
	const [values, setValues] = useState( getInitialValues( customer ) );

	const initialFields                 = getFields( values );
	const [fields, setFields]           = useState( initialFields );
	const [isSaving, setIsSaving]       = useState( false );
	const [hadChanged, setHadChanged]   = useState( false );
	const [savingError, setSavingError] = useState( false );

	useEffect( () => {
		if ( hadChanged ) {
			setValues( { ...values, billing_state: '' } );
		}
	}, [values.billing_country] );

	useEffect( () => {
		if ( hadChanged ) {
			setValues( { ...values, shipping_state: '' } );
		}
	}, [values.shipping_country] );

	useEffect( () => {
		if ( hadChanged ) {
			setFields( getFields( values ) );
		}
	}, [values] );

	const handleChange = ( changedValues ) => {
		setHadChanged( true );
		setValues( changedValues );
	}

	const updateCustomer = () => {
		const theCustomer = applyFilters( 'yith_pos_customer_to_update', getCustomerDataFromValues( values ), { values } );

		const options   = {
			yith_pos_update_customer: true,
			yith_pos_request        : 'update-customer'
		};
		const queryArgs = {
			path  : addQueryArgs( 'wc/v3/customers/' + customer.id, options ),
			data  : theCustomer,
			method: 'PUT'
		};

		apiFetch( queryArgs ).then(
			updatedCustomer => {
				loggerStore.addLog( 'updated-customer', 'Updated Customer', updatedCustomer );
				setIsSaving( false );
				onSave( updatedCustomer );
			},
			error => {
				loggerStore.addLog( 'updated-customer', 'Updated Customer Error', error );
				const errorMessage = ( error.code === 'registration-error-email-exists' ) ? __( 'An account is already registered with this email address.', 'yith-point-of-sale-for-woocommerce' ) : error.message;
				setSavingError( errorMessage );
				setIsSaving( false );
			} );
	};

	const createCustomer = () => {
		const theCustomer = applyFilters( 'yith_pos_customer_to_create', getCustomerDataFromValues( values ) );

		if ( applyFilters( 'yith_pos_customer_use_email_as_username', false, theCustomer ) ) {
			theCustomer.username = theCustomer.email;
		} else {
			const username       = theCustomer.first_name + '_' + theCustomer.last_name + '_' + new Date().valueOf();
			theCustomer.username = username.replace( /[^\w\s]/gi, '' );
		}

		const options = {
			yith_pos_add_customer: true,
			yith_pos_request     : 'create-customer'
		};

		const queryArgs = {
			path  : addQueryArgs( 'wc/v3/customers', options ),
			data  : theCustomer,
			method: 'POST'
		};

		apiFetch( queryArgs ).then(
			createdCustomer => {
				loggerStore.addLog( 'added-new-customer', 'Added new Customer', createdCustomer );
				setIsSaving( false );
				onSave( createdCustomer );
			}, error => {
				loggerStore.addLog( 'added-new-customer', 'Added new Customer Error', error );
				const errorMessage = ( error.code === 'registration-error-email-exists' ) ? __( 'An account is already registered with this email address.', 'yith-point-of-sale-for-woocommerce' ) : error.message;
				setSavingError( errorMessage );
				setIsSaving( false );
			} );
	};

	const handleSave = () => {
		setIsSaving( true );
		setSavingError( false );

		if ( customer?.id ) {
			updateCustomer();
		} else {
			createCustomer();
		}
	}

	return <ControlledForm
		className="customer-form"
		fields={fields}
		values={values}
		onChange={handleChange}
		onSave={handleSave}
		error={savingError}
		isSaving={isSaving}
		saveText={__( 'Save customer', 'yith-point-of-sale-for-woocommerce' )}
	/>
}