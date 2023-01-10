/** global yithPosSettings */
import React from 'react';

import Form                      from '../common/form';
import NumericRegisterController from "../common/fields/numeric-register-controller";
import { formatCurrency }        from '../../packages/numbers/';

import { i18n_cart_label as labels, selectFeeOptions, selectTypeAmountOptions } from './config';

class CartAddFeeOrDiscount extends Form {

	constructor() {
		super( ...arguments );
		const { currentFeeOrDiscount } = this.props;
		let defaultData = {
			type      : 'discount',
			typeAmount: 'fixed',
			amount    : '0',
			percentage: false,
			reason    : ''
		};

		this.state = {
			data       : Object.assign( {}, defaultData, currentFeeOrDiscount ),
			error      : {},
			amountFocus: true
		};

		this.presets = yithPosSettings.feeAndDiscountPresets;
	}


	handleReasonClick = () => {
		this.setState( { amountFocus: false } );
	}

	handleFieldChange = ( { currentTarget: input } ) => {

		let { data, amountFocus } = this.state;

		data[ input.name ] = input.value;

		if ( input.name === 'typeAmount' ) {
			data.percentage = ( input.value === 'percentage' );
		}

		if ( input.name === 'reason' ) {
			amountFocus = ( input.value === 'percentage' );
		}

		this.setState( { data, amountFocus } );
	};

	updateValue = ( newValue, percentage ) => {
		const { data }     = this.state;
		const newData      = { ...data };
		newData.amount     = newValue;
		newData.typeAmount = ( percentage === true ) ? 'percentage' : 'fixed';
		newData.percentage = percentage;
		this.setState( { data: newData, amountFocus: true } );
	};

	doSubmit = () => {
		this.props.saveFeeOrDiscount( this.state.data );
	};

	onClick = ( { currentTarget: input } ) => {
		if ( input.name === 'amount' ) {
			this.setState( { amountFocus: true } );
		}

		if ( input.name === 'reason' ) {
			this.setState( { amountFocus: false } );
		}
	}

	handleAmountTypeChange = ( newValue ) => {
		const { data }     = this.state;
		const newData      = { ...data };
		newData.typeAmount = newValue;
		newData.percentage = 'percentage' === newValue;
		this.setState( { data: newData } );
	};

	render() {

		const { onUndo, getTestTotalWithFee } = this.props;
		const { data, amountFocus }           = this.state;

		const amountToPay = formatCurrency( getTestTotalWithFee( data ) );
		const formClass   = "cart-add-fee-or-discount" + ( amountFocus ? " focus-on-amount" : '' );

		return (

			<form onSubmit={this.handleSubmit} className={formClass} onClick={e => e.preventDefault()}>
				<div className="form-row">
					<div className="form-group types">
						{this.renderSelect( 'type', labels.typeLabel, selectFeeOptions )}
						{this.renderSelect( 'typeAmount', labels.amountTypeLabel, selectTypeAmountOptions, this.handleAmountTypeChange )}
					</div>
					{this.renderInput( 'amount', labels.amountLabel, '', "text", true, true )}

				</div>
				<div className="form-row">
					{this.renderInput( 'reason', labels.reasonLabel, '', 'text', false )}
					<div className="form-group form-group-amountToPay">
						<label>{labels.amountToPayLabel}</label>
						<input type="text" readOnly value={amountToPay}/>
					</div>
				</div>
				<NumericRegisterController labelPresets={labels.labelPresets} backLabel={labels.backLabel}
					presets={this.presets} data={data}
					presetsAsPercentage={true} submitLabel={labels.submitLabel}
					onSubmit={this.doSubmit}
					onUndo={onUndo} onChange={this.updateValue}/>
			</form>

		);
	}

}

export default CartAddFeeOrDiscount;
