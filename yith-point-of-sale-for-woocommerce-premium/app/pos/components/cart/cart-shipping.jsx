/** global yithPosSettings */
import React, { Component, Fragment } from 'react';

import NumericRegisterController from "../common/fields/numeric-register-controller";
import FormInput                 from "../common/fields/form-input";

import { getShippingMethodsOptions } from "../../packages/shipping";
import { formatCurrency }            from "../../packages/numbers";
import { i18n_cart_label as labels } from "./config";
import Select                        from '../../packages/components/select';
import Input                         from '../../packages/components/input';


class CartShipping extends Component {

	constructor() {
		super( ...arguments );

		this.numericData                = { amount: '', percentage: false };
		const { currentShippingMethod } = this.props;

		let defaultData = {
			type  : 'shipping',
			amount: 0,
			title : '',
			method: ''
		};


		this.state = {
			shippingMethodsOption: [],
			data                 : Object.assign( {}, defaultData, currentShippingMethod )
		}

	}

	async componentDidMount() {
		let { data }                    = this.state;
		const { currentShippingMethod } = this.props;
		const shippingMethodsOption     = await getShippingMethodsOptions();
		if ( !currentShippingMethod ) {
			data.method = shippingMethodsOption[ 0 ].key;
			data.title  = shippingMethodsOption[ 0 ].label;
		}
		this.setState( { data, shippingMethodsOption } );
	}

	handleChangeShippingMethod = ( method ) => {
		const { shippingMethodsOption, data } = this.state;
		const shippingMethodTitle             = shippingMethodsOption.filter( ( option ) => method === option.key );

		data.method = method;
		data.title  = shippingMethodTitle[ 0 ].label;
		this.setState( { data } );
	};

	updateValue = ( value, percentage ) => {
		let { data } = this.state;
		data.amount  = parseFloat( value );

		this.setState( { data } );
	};

	getCurrentNumbericDataAmount = () => {
		let { data }            = this.state;
		this.numericData.amount = data.amount;
		return this.numericData;
	};

	doSubmit = () => {
		let { data }                            = this.state;
		const { currentShippingMethod, onSave } = this.props;

		if ( currentShippingMethod ) {
			data.key = currentShippingMethod.key;
		}

		onSave( data );
	};

	render() {
		const { onUndo, getTestTotalWithShipping } = this.props;
		const { shippingMethodsOption, data }      = this.state;
		const amountToPay                          = formatCurrency( getTestTotalWithShipping( data ) );
		return (

			<Fragment>
				<div className="shipping-method">
					<span className="shipping-method__label">{labels.shippingMethod}</span>
					<span className="shipping-method__label">{labels.amountLabel}</span>
				</div>
				<div className="shipping-method">
					<Select
						value={data.method}
						options={shippingMethodsOption}
						onChange={this.handleChangeShippingMethod}
					/>
					<Input
						type="text"
						name="shippingAmount"
						value={data.amount}
						readOnly={true}
					/>
				</div>

				<div className="shipping-method-amount-to-pay">
					<FormInput
						type="text"
						name="amountToPay"
						value={amountToPay}
						label={labels.amountToPayLabel}
						readOnly={true}
						isRequired={false}
						error={false}
					/>
				</div>

				<NumericRegisterController labelPresets={false} backLabel={labels.backLabel}
					presets={false} data={this.getCurrentNumbericDataAmount()}
					submitLabel={labels.submitShippingLabel}
					onSubmit={this.doSubmit}
					onUndo={onUndo} onChange={this.updateValue}/>

			</Fragment>


		);
	}
}

export default CartShipping;