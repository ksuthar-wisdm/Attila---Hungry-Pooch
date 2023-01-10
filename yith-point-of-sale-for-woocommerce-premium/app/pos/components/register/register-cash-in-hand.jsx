import React  from 'react';
import _      from "lodash";
import { __ } from '@wordpress/i18n';

import Form                      from '../common/form';
import NumericRegisterController from "../common/fields/numeric-register-controller";

const selectCashInHandOptions = [
	{ key: 'add', label: __( 'Add', 'yith-point-of-sale-for-woocommerce' ), icon: 'add-circle' },
	{ key: 'remove', label: __( 'Remove', 'yith-point-of-sale-for-woocommerce' ), icon: 'remove-circle' }
];

class RegisterCashInHand extends Form {

	constructor() {
		super( ...arguments );

		this.state = {
			data   : {
				amount: '',
				reason: '',
				type  : 'add'
			},
			error  : {},
			focusOn: 'amount'
		};

	}

	doSubmit = () => {
		const { amount, type, reason } = this.state.data;
		const { error }                = this.state;

		this.validateField( 'amount' );

		if ( !_.isEmpty( error ) ) {
			return;
		}

		const cash = ( type === 'add' ) ? parseFloat( amount ) : ( -1 ) * parseFloat( amount );
		this.props.setCashInHand( cash, reason );
	};

	validateField = ( field ) => {
		const { data, error } = this.state;
		delete error[ field ];

		if ( data[ field ] === '' ) {
			error[ field ] = __( 'This field is required', 'yith-point-of-sale-for-woocommerce' );
		}

		this.setState( { error } );
	};


	updateValue = ( newValue, percentage ) => {
		let { data }     = this.state;
		data[ 'amount' ] = newValue;
		this.setState( { data, focusOn: 'amount' } );
	};

	onClick = ( { currentTarget: input } ) => {
		if ( input.name ) {
			this.setState( { focusOn: input.name } );
		}
	}

	render() {
		const { onUndo }        = this.props;
		const { data, focusOn } = this.state;

		const formClass = `yith-pos__register-open focus-on-${focusOn}`;

		return (
			<form onSubmit={this.handleSubmit} className={formClass}
				onClick={e => e.preventDefault()}>
				<div className="cash-in-hand-wrap">
					{this.renderSelect( 'type', __( 'Add or remove cash', 'yith-point-of-sale-for-woocommerce' ), selectCashInHandOptions )}
					{this.renderInputAmount( 'amount', __( 'Cash in hand', 'yith-point-of-sale-for-woocommerce' ) )}
				</div>
				{this.renderInput( 'reason', __( 'Reason', 'yith-point-of-sale-for-woocommerce' ) )}
				<NumericRegisterController backLabel={__( 'Back', 'yith-point-of-sale-for-woocommerce' )} data={data} presets={false}
					submitLabel={__( 'Save Cash', 'yith-point-of-sale-for-woocommerce' )} onSubmit={this.doSubmit}
					onUndo={onUndo} onChange={this.updateValue}/>

			</form>
		);
	}
}


export default RegisterCashInHand;