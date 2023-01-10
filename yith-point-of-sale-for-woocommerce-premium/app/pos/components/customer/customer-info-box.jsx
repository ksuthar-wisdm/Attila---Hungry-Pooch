import React, { Component, Fragment } from 'react';
import { applyFilters }               from '@wordpress/hooks';
import { __, sprintf }                from '@wordpress/i18n';

import { getCustomerFullName, getFormattedAddress, getCustomerVAT } from "../../packages/customers";
import { tokenPrintf }                                              from '../../packages/utils';
import { getVatFieldLabel }                                         from '../../packages/settings';

const CUSTOMER_INFO_BOX_DETAILS                  = 'yith_pos_customer_info_box_details';
const CUSTOMER_INFO_BOX_SHIPPING_REQUIRED_FIELDS = 'yith_pos_customer_info_box_shipping_required_fields';

const VAT_LABEL = getVatFieldLabel();

const requiredFieldLabels = {
	first_name: __( 'first name', 'yith-point-of-sale-for-woocommerce' ),
	last_name : __( 'last name', 'yith-point-of-sale-for-woocommerce' ),
	email     : __( 'email', 'yith-point-of-sale-for-woocommerce' )
};

const getRequiredFieldName = ( field ) => requiredFieldLabels[ field ] ?? field;

function checkCustomerFields( customer ) {
	const billingRequired  = ['first_name', 'last_name', 'email'];
	const shippingRequired = applyFilters( CUSTOMER_INFO_BOX_SHIPPING_REQUIRED_FIELDS, ['first_name', 'last_name'], customer );
	const missingBilling   = billingRequired.filter( _ => !( customer.billing[ _ ] ?? false ) );
	const missingShipping  = shippingRequired.filter( _ => !( customer.shipping[ _ ] ?? false ) );

	if ( missingBilling.length || missingShipping.length ) {
		const errors = [];

		if ( missingBilling.length ) {
			errors.push(
				tokenPrintf(
					__( 'The following fields are required for billing details: %s.', 'yith-point-of-sale-for-woocommerce' ),
					missingBilling.map( getRequiredFieldName ).join( ', ' )
				)
			);
		}

		if ( missingShipping.length ) {
			errors.push(
				sprintf(
					__( 'The following fields are required for shipping details: %s.', 'yith-point-of-sale-for-woocommerce' ),
					missingShipping.map( getRequiredFieldName ).join( ', ' )
				)
			);
		}

		return { errors, isValid: false };
	}

	return { errors: [], isValid: true };
}

function getCustomerInfo( customer ) {
	const billingAddress  = getFormattedAddress( customer, 'billing' );
	const shippingAddress = getFormattedAddress( customer, 'shipping' );
	const fullName        = getCustomerFullName( customer );
	const vat             = getCustomerVAT( customer );

	return applyFilters(
		CUSTOMER_INFO_BOX_DETAILS,
		[
			{ id: 'full-name', label: __( 'Name', 'yith-point-of-sale-for-woocommerce' ), value: fullName },
			{ id: 'company', label: __( 'Company', 'yith-point-of-sale-for-woocommerce' ), value: customer.billing.company },
			{ id: 'vat', label: VAT_LABEL, value: vat },
			{ id: 'phone', label: __( 'Phone', 'yith-point-of-sale-for-woocommerce' ), value: customer.billing.phone },
			{ id: 'email', label: __( 'Email', 'yith-point-of-sale-for-woocommerce' ), value: customer.billing.email },
			{ id: 'billing-address', label: __( 'Billing address', 'yith-point-of-sale-for-woocommerce' ), value: billingAddress },
			{ id: 'shipping-address', label: __( 'Shipping address', 'yith-point-of-sale-for-woocommerce' ), value: shippingAddress }
		],
		customer
	);
}

export default function CustomerInfoBox( { customer, onClick } ) {
	const { errors, isValid } = checkCustomerFields( customer );
	const info                = getCustomerInfo( customer );

	return <>
		<div className="customer-info-box" onClick={onClick}>
			{info.map( ( row ) => {
				const show = row?.show ?? !!row.value;
				return !!show && <div className="customer-info-box__row" key={row.id}><strong>{row.label}:</strong> {row.value}</div>;
			} )}
			<i className="customer-info-box__edit yith-pos-icon-pencil"/>
			{!isValid && errors.map( ( error, idx ) => <div className="customer-info-box__error" key={idx}>{error}</div> )}
		</div>
	</>
}