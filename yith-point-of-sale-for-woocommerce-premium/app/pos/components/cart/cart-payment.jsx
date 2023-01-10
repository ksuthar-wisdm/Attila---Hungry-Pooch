/** global yithPosSettings */
import React, { Component, Fragment } from 'react';
import _                              from 'lodash';

import NumericRegisterController from "../common/fields/numeric-register-controller";

import { getFilteredGatewaysOptions, getDefaultGatewaysOption } from '../../packages/gateways';
import { getPaymentPresets, formatCurrency }                    from '../../packages/numbers';
import { i18n_cart_label as labels }                             from "./config";

import Button     from '../../packages/components/button';
import Input      from '../../packages/components/input';
import Select     from '../../packages/components/select';


class CartPayment extends Component {

	constructor() {
		super( ...arguments );

		this.default     = { amount: '', paymentMethod: '' };
		this.numericData = { amount: '', percentage: false };

		this.state = {
			totalPayable               : this.props.total,
			totalPaying                : 0,
			balance                    : this.props.total,
			change                     : 0,
			paymentMethodsOption       : [],
			currentPaymentMethod       : 0,
			defaultPaymentMethodsOption: getDefaultGatewaysOption(),
			data                       : [{ ...this.default }]
		}

	}

	componentDidMount() {
		const paymentMethodsOption        = getFilteredGatewaysOptions();
		const defaultPaymentMethodsOption = getDefaultGatewaysOption();
		this.default.paymentMethod        = defaultPaymentMethodsOption;
		const data                        = [{ ...this.default }];
		this.setState( { data, paymentMethodsOption, defaultPaymentMethodsOption } );
	}


	addNewPaymentRow = () => {
		let { data }        = this.state;
		this.default.amount = 0;
		data.push( { ...this.default } );
		const currentPaymentMethod = data.length - 1;
		this.setState( { data, currentPaymentMethod } );
	};

	getCurrentNumericDataAmount = () => {
		const { data, currentPaymentMethod } = this.state;
		this.numericData.amount              = data[ currentPaymentMethod ].amount;
		return this.numericData;
	};

	handlePaymentMethodClick = ( index ) => {
		let { currentPaymentMethod } = this.state;
		if ( index !== currentPaymentMethod ) {
			this.setState( { currentPaymentMethod: index } );
		}
	};

	removePaymentMethod = ( indexToRemove ) => {
		let { data } = this.state;
		data         = data.filter( ( item, index ) => index !== indexToRemove );
		if ( data.length === 0 ) {
			data = [{ ...this.default }];
		}
		const currentPaymentMethod = ( indexToRemove - 1 < 0 ) ? 0 : indexToRemove - 1;
		this.calculateTotals( data, currentPaymentMethod );
	};

	handleChangePaymentMethod = ( updatedMethod ) => {
		let { data, currentPaymentMethod }         = this.state;
		data[ currentPaymentMethod ].paymentMethod = updatedMethod;
		data                                       = this.checkData( data );
		this.setState( { data } );
	};

	checkData = ( data ) => {
		const { currentPaymentMethod, totalPayable } = this.state;

		if ( currentPaymentMethod in data ) {
			let totalPaying = 0;
			data.forEach( ( item, index ) => {
							  if ( index !== currentPaymentMethod ) {
								  totalPaying += parseFloat( item.amount ) || 0;
							  }
						  }
			);
		}

		return data;
	};

	updateValue = ( value, percentage ) => {
		const { data, currentPaymentMethod }   = this.state;
		let newData                            = _.clone( data );
		newData[ currentPaymentMethod ].amount = parseFloat( value ) || 0;
		newData                                = this.checkData( newData );
		this.calculateTotals( newData, currentPaymentMethod );
	};

	calculatePresets = () => {
		const { balance, change, data, currentPaymentMethod } = this.state;
		const currentAmount                                   = parseFloat( data[ currentPaymentMethod ].amount ) || 0;
		const amount                                          = balance - change + currentAmount;
		return getPaymentPresets( Math.max( 0, amount ), 6 );
	};

	calculateTotals = ( data, currentPaymentMethod ) => {
		let { totalPayable } = this.state;
		let totalPaying      = 0;
		data.forEach( ( item ) => {
						  totalPaying += parseFloat( item.amount ) || 0;
					  }
		);
		const difference = ( totalPayable - totalPaying );
		const balance    = difference > 0 ? difference : 0;
		const change     = ( difference < 0 ? difference : 0 ) * ( -1 );

		this.setState( { data, currentPaymentMethod, totalPaying, balance, change } );
	};

	doSubmit = () => {
		const { balance, change } = this.state;
		let { data }              = this.state;

		if ( balance > 0 ) {
			return;
		}

		let paymentMethods = [];
		let indexCash      = '';
		data               = data.filter( ( item ) => ( parseFloat( item.amount ) || 0 ) !== 0 );
		data.forEach( ( item, index ) => {
						  if ( item.paymentMethod === 'yith_pos_cash_gateway' ) {
							  if ( indexCash === '' ) {
								  indexCash                   = index;
								  paymentMethods[ indexCash ] = item;
							  } else {
								  paymentMethods[ indexCash ][ 'amount' ] += parseFloat( item.amount ) || 0;
							  }
						  } else {
							  paymentMethods[ index ] = item;
						  }
					  }
		);

		if ( change > 0 ) {
			let cashRemoved = false;
			paymentMethods.forEach( ( item, index ) => {
										if ( item.paymentMethod === 'yith_pos_cash_gateway' ) {
											paymentMethods[ index ].amount = ( parseFloat( item.amount ) || 0 ) - change;
											cashRemoved                    = true;
										}
									}
			);

			if ( !cashRemoved ) {
				paymentMethods.push( { amount: -change, paymentMethod: 'yith_pos_cash_gateway' } );
			}
		}


		this.props.onPay( { paymentMethods, change, balance } );
	};


	render() {
		const { onUndo }                                                                                                                    = this.props;
		const { totalPayable, totalPaying, balance, change, paymentMethodsOption, defaultPaymentMethodsOption, data, currentPaymentMethod } = this.state;
		const classNamePaymentMethods                                                                                                       = "payment-methods" + ( balance > 0 ? ' disableSubmit' : '' );
		return (
			<Fragment>
				<div className="payment-totals">
					<div className="total total-payable">
						<span className="label">{labels.totalPayable}</span>
						<span className="amount">{formatCurrency( totalPayable )}</span>
					</div>
					<div className="total total-paying">
						<span className="label">{labels.totalPaying}</span>
						<span className="amount">{formatCurrency( totalPaying )}</span>
					</div>
					<div className="total balance">
						<span className="label">{labels.balance}</span>
						<span className="amount">{formatCurrency( balance )}</span>
					</div>
					<div className="total change">
						<span className="label">{labels.change}</span>
						<span className="amount">{formatCurrency( change )}</span>
					</div>
				</div>

				<div className={classNamePaymentMethods}>
					<div className="payment-method-label">
						<span className="payment-method__amount-label">{labels.amountPaying}</span>
						<span className="payment-method__payment-option">{labels.paymentOption}</span>
					</div>
					{data.map( ( item, index ) => {
						const nameAmount        = 'amount-' + index;
						const namePaymentMethod = 'paymentMethod-' + index;
						const classCurrent      = "payment-method" + ( ( currentPaymentMethod === index ) ? ' current' : '' );
						const classClear        = "payment-method__remove" + ( ( index === 0 ) ? ' first' : '  yith-pos-icon-clear' );
						return (
							<div key={index} className={classCurrent}
								onClick={() => this.handlePaymentMethodClick( index )}>
								<div className={classClear} onClick={( e ) => {
									e.stopPropagation();
									this.removePaymentMethod( index );
								}}/>
								<Input
									className="payment-method__amount"
									type="text"
									value={item.amount}
									readOnly={true}
								/>
								<Select
									className="payment-method__method payment-methods-select"
									popoverClassName="payment-methods-select__popover"
									value={item?.paymentMethod ?? defaultPaymentMethodsOption}
									options={paymentMethodsOption}
									onChange={this.handleChangePaymentMethod}
								/>
							</div>
						)
					} )}

					<Button
						variant="primary"
						className="add-payment-method"
						onClick={this.addNewPaymentRow}
						leftIcon="add"
						fullWidth
					>
						{labels.addNewPayment}
					</Button>

					<NumericRegisterController labelPresets={labels.labelPaymentPresets} backLabel={labels.backLabel}
						presets={this.calculatePresets()} data={this.getCurrentNumericDataAmount()}
						submitLabel={labels.submitPaymentLabel}
						onSubmit={this.doSubmit}
						onUndo={onUndo} onChange={this.updateValue}/>
				</div>
			</Fragment>


		);
	}
}

export default CartPayment;
