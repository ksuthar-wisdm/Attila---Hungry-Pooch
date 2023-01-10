import { isValidEmail, isValidPhone }                    from '../../../packages/utils';
import { __ }                                            from '@wordpress/i18n';
import { getCountriesOptions, getStateOptionsByCountry } from '../../../packages/data';
import { getCustomerVAT }                                from '../../../packages/customers';
import { applyFilters }                                  from '@wordpress/hooks';
import { getVatFieldLabel }                              from '../../../packages/settings';

const countriesOptions = getCountriesOptions();
const VAT_LABEL        = getVatFieldLabel();

export const validateEmail = ( email ) => {
	return isValidEmail( email ) ? true : __( 'Invalid email address', 'yith-point-of-sale-for-woocommerce' );
}

/* Added by WisdmLabs */
export const validatePhone = ( phone ) => {
	return isValidPhone( phone ) ? true : __( 'Invalid Phone number', 'yith-point-of-sale-for-woocommerce' );
}
/* Added by WisdmLabs */

export const getBillingFields = ( values ) => {
	const { billing_country } = values;

	const billingStates                 = !!billing_country ? getStateOptionsByCountry( billing_country ) : [];
	const billingStateAdditionalOptions = !!billingStates.length ?
										  { type: 'select', options: billingStates, placeholder: __( 'Select a state...', 'yith-point-of-sale-for-woocommerce' ), allowSearch: true } :
										  { type: 'text' };

	const fields = [
		{ key: 'billing_first_name', type: 'text', label: __( 'First name', 'yith-point-of-sale-for-woocommerce' ), isRequired: true },
		{ key: 'billing_last_name', type: 'text', label: __( 'Last name', 'yith-point-of-sale-for-woocommerce' ), isRequired: true },
		{ key: 'billing_company', type: 'text', label: __( 'Company', 'yith-point-of-sale-for-woocommerce' ) },
		{ key: 'pos_billing_vat', type: 'text', label: VAT_LABEL },
		{ key: 'billing_email', type: 'text', label: __( 'Email', 'yith-point-of-sale-for-woocommerce' ), isRequired: true, validate: validateEmail },
		{ key: 'billing_phone', type: 'text', label: __( 'Phone', 'yith-point-of-sale-for-woocommerce' ), isRequired: true, validate: validatePhone },
		{ key: 'billing_address_1', type: 'text', label: __( 'Address', 'yith-point-of-sale-for-woocommerce' ) },
		{ key: 'billing_address_2', type: 'text' },
		{ key: 'billing_city', type: 'text', label: __( 'City', 'yith-point-of-sale-for-woocommerce' ) },
		{ key: 'billing_postcode', type: 'text', label: __( 'Post Code', 'yith-point-of-sale-for-woocommerce' ) },
		{ key: 'billing_country', type: 'select', label: __( 'Country', 'yith-point-of-sale-for-woocommerce' ), options: countriesOptions, allowSearch: true },
		{ key: 'billing_state', label: __( 'State', 'yith-point-of-sale-for-woocommerce' ), ...billingStateAdditionalOptions }
	];

	return applyFilters( 'yith_pos_customer_billing_fields', fields, { values } );
}

export const getShippingFields = ( values ) => {
	const { shipping_country } = values;

	const shippingStates                 = !!shipping_country ? getStateOptionsByCountry( shipping_country ) : [];
	const shippingStateAdditionalOptions = !!shippingStates.length ?
										   { type: 'select', options: shippingStates, placeholder: __( 'Select a state...', 'yith-point-of-sale-for-woocommerce' ), allowSearch: true } :
										   { type: 'text' };

	return [
		{ key: 'shipping_first_name', type: 'text', label: __( 'First name', 'yith-point-of-sale-for-woocommerce' ), isRequired: true },
		{ key: 'shipping_last_name', type: 'text', label: __( 'Last name', 'yith-point-of-sale-for-woocommerce' ), isRequired: true },
		{ key: 'shipping_phone', type: 'text', label: __( 'Phone', 'yith-point-of-sale-for-woocommerce' ) },
		{ key: 'shipping_address_1', type: 'text', label: __( 'Address', 'yith-point-of-sale-for-woocommerce' ) },
		{ key: 'shipping_address_2', type: 'text' },
		{ key: 'shipping_city', type: 'text', label: __( 'City', 'yith-point-of-sale-for-woocommerce' ) },
		{ key: 'shipping_postcode', type: 'text', label: __( 'Post Code', 'yith-point-of-sale-for-woocommerce' ) },
		{ key: 'shipping_country', type: 'select', label: __( 'Country', 'yith-point-of-sale-for-woocommerce' ), options: countriesOptions, allowSearch: true },
		{ key: 'shipping_state', label: __( 'State', 'yith-point-of-sale-for-woocommerce' ), ...shippingStateAdditionalOptions }
	];
}

export const getFields = ( values ) => {
	const { use_billing_for_shipping } = values;

	const billing = getBillingFields( values );

	const middle = [
		{ key: 'use_billing_for_shipping', type: 'switch', label: __( 'Use the same info for shipping', 'yith-point-of-sale-for-woocommerce' ) }
	];

	const shipping = getShippingFields( values );

	let fields = billing.concat( middle );
	if ( !use_billing_for_shipping ) {
		fields = fields.concat( shipping );
	}

	return fields;
}

export const getInitialShippingValues = ( customer ) => {
	return {
		shipping_first_name: customer?.shipping?.first_name ?? '',
		shipping_last_name : customer?.shipping?.last_name ?? '',
		shipping_phone     : customer?.shipping?.phone ?? '',
		shipping_address_1 : customer?.shipping?.address_1 ?? '',
		shipping_address_2 : customer?.shipping?.address_2 ?? '',
		shipping_city      : customer?.shipping?.city ?? '',
		shipping_postcode  : customer?.shipping?.postcode ?? '',
		shipping_country   : customer?.shipping?.country ?? '',
		shipping_state     : customer?.shipping?.state ?? ''
	};
}

export const getInitialValues = ( customer ) => {
	const values = {
		billing_first_name      : customer?.billing?.first_name ?? customer?.first_name ?? '',
		billing_last_name       : customer?.billing?.last_name ?? customer?.last_name ?? '',
		billing_company         : customer?.billing?.company ?? '',
		pos_billing_vat         : getCustomerVAT( customer ), // Use `pos_` as prefix, since it's a custom field that will be stored in meta_data.
		billing_email           : customer?.billing?.email ?? customer?.email ?? '',
		billing_phone           : customer?.billing?.phone ?? '',
		billing_address_1       : customer?.billing?.address_1 ?? '',
		billing_address_2       : customer?.billing?.address_2 ?? '',
		billing_city            : customer?.billing?.city ?? '',
		billing_postcode        : customer?.billing?.postcode ?? '',
		billing_country         : customer?.billing?.country ?? '',
		billing_state           : customer?.billing?.state ?? '',
		use_billing_for_shipping: true,
		...getInitialShippingValues( customer )
	};

	const shipping = getValuesByType( values, 'shipping' );

	// Use the same, if shipping fields are empty or if shipping and billing are really the same.
	values.use_billing_for_shipping = Object.values( shipping ).filter( _ => !!_ ).length === 0 ||
									  Object.keys( shipping ).filter( _ => {
										  const billingValue = customer?.billing[ _ ] ?? '';
										  return shipping[ _ ] !== billingValue;
									  } ).length === 0;

	return applyFilters( 'yith_pos_customer_initial_values', values, { customer } );
}

export const getValuesByType = ( values, type ) => {
	const keys = Object.keys( values ).filter( _ => _.startsWith( type + '_' ) );
	return keys.reduce( ( acc, key ) => {
		const realKey  = key.substr( type.length + 1 );
		acc[ realKey ] = values[ key ];
		return acc;
	}, {} );
}

export const getCustomerDataFromValues = ( values ) => {
	const { use_billing_for_shipping } = values;
	const shipping                     = getValuesByType( values, 'shipping' );
	const billing                      = getValuesByType( values, 'billing' );

	if ( use_billing_for_shipping ) {
		Object.keys( shipping ).forEach( key => shipping[ key ] = billing[ key ] );
	}

	const data = {
		email     : billing.email,
		first_name: billing.first_name,
		last_name : billing.last_name,
		shipping,
		billing,
		meta_data : [
			{ key: 'billing_vat', value: values?.pos_billing_vat ?? '' }
		]
	};

	return applyFilters( 'yith_pos_customer_data_from_values', data, { values } );
}