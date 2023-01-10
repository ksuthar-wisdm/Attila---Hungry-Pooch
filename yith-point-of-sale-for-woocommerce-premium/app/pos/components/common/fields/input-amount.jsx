import React, { Component } from "react";
import { noop }             from "lodash";

class InputAmount extends Component {

	constructor() {
		super( ...arguments );
	}


	switch = ( percentage ) => {
		this.props.onSwitch( percentage );
	}

	render() {
		const { name, label, value, data } = this.props;
		const { percentage }               = data;
		const classGroup                   = 'form-group form-group-' + name;
		const classDiscount                = 'discount' + ( percentage ? ' active' : '' );
		const classCurrency                = 'currency' + ( percentage ? '' : ' active' );

		const handleClick = this.props.onClick || noop;

		return (
			<div className={classGroup}>
				<label htmlFor={name}>{label}</label>
				<div className="input-amount-group">
					<button className={classCurrency} onClick={() => this.switch( false )}>{yithPosSettings.wc.currency.symbol}</button>
					<button className={classDiscount} onClick={() => this.switch( true )}>%</button>
					<input name={name} id={name} value={value} className="form-control" readOnly onClick={handleClick}/>
				</div>
			</div>
		);
	}
}

export default InputAmount;
