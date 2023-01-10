import { useEffect, useState } from 'react';
import { __ }                  from '@wordpress/i18n';

import Modal          from '../../packages/components/modal';
import ControlledForm from '../common/controlled-form';

import { getInitialShippingValues, getShippingFields, getValuesByType } from './customer-form/utils';

export default function CustomerShippingModal( { customer, onClose, onSave } ) {
	const [values, setValues]         = useState( getInitialShippingValues( customer ) );
	const initialFields               = getShippingFields( values );
	const [fields, setFields]         = useState( initialFields );
	const [hadChanged, setHadChanged] = useState( false );

	useEffect( () => {
		if ( hadChanged ) {
			setFields( getShippingFields( values ) );
			setValues( { ...values, shipping_state: '' } );
		}
	}, [values.shipping_country] );

	const handleChange = ( changedValues ) => {
		setHadChanged( true );
		setValues( changedValues );
	}

	const handleSave = () => {
		const shipping = getValuesByType( values, 'shipping' );
		onSave( { ...customer, shipping } );
		onClose();
	}

	return <Modal title={__( 'Shipping address', 'yith-point-of-sale-for-woocommerce' )} onClose={onClose}>
		<ControlledForm
			className="customer-form"
			fields={fields}
			values={values}
			onChange={handleChange}
			onSave={handleSave}
			saveText={__( 'Save shipping address', 'yith-point-of-sale-for-woocommerce' )}
		/>
	</Modal>
}