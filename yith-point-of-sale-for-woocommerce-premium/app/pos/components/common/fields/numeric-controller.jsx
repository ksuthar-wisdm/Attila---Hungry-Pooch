/** global yithPosSettings */
import React, { Component } from "react";
import { doAction }         from '@wordpress/hooks';

class NumericController extends Component {

	constructor() {
		super( ...arguments );

		const { withPercentage, initialValue } = this.props;
		this.withPercentage                    = withPercentage !== undefined ? withPercentage : true;
		this.initialValue                      = initialValue !== undefined ? initialValue : '';

		this.state = {
			value     : this.initialValue,
			percentage: false,
			error     : false
		};
	}

	componentDidMount() {
		document.addEventListener( 'keydown', this.handleKeyDown, true );
	}

	componentWillUnmount() {
		document.removeEventListener( 'keydown', this.handleKeyDown, true );
	}

	componentDidUpdate( prevProps, prevState ) {
		if ( prevProps.initialValue !== this.props.initialValue ) {
			this.setState( { value: this.props.initialValue, percentage: false } );
		}
	}

	handleKeyDown = ( e ) => {
		e.stopPropagation();
		const { key } = e;

		if ( ( /\d/ ).test( key ) ) {
			this.insertDigit( parseInt( key, 10 ) );
		} else if ( key === 'Backspace' ) {
			this.clearLastChar();
		} else if ( key === 'Enter' ) {
			this.apply();
		} else if ( key === '%' ) {
			this.switchMode( true );
		} else if ( key === '.' || key === ',' ) {
			this.inputDot();
		} else {
			const args = {
				value   : this.state.value,
				setValue: _ => this.setState( { value: _ } ),
				event   : e,
				key
			}
			doAction( 'yith_pos_numeric_controller_handle_keydown_custom', args );
		}
	};

	clearLastChar = () => {
		let value   = this.state.value;
		value       = value.length ? value.substring( 0, value.length - 1 ) : '';
		const error = this.checkValue( value, this.state.percentage );
		this.setState( { value, error } );
	};

	clearAll = () => {
		this.setState( { value: '', error: false } );
	};

	checkValue = ( value, percentage ) => {
		if ( !percentage ) {
			return false;
		}
		return parseFloat( value ) > 100;
	};

	insertDigit = ( digit ) => {
		let { value, percentage } = this.state;
		value                     = ( value === '0' ) ? digit.toString() : value + digit.toString();
		const error               = this.checkValue( value, percentage );
		this.setState( { value, error } );
	};

	switchMode = ( percentage = '' ) => {
		percentage  = percentage || !this.state.percentage;
		const error = this.checkValue( this.state.value, percentage );
		this.setState( { percentage, error } );
	};

	percentageDiscount = ( discount ) => {
		this.setState( {
						   value     : String( discount ),
						   percentage: true,
						   error     : false
					   } );
	};

	inputDot = () => {
		let value = this.state.value;
		value     = String( value );
		if ( value.indexOf( '.' ) < 0 ) {
			value += '.';
		}
		this.setState( { value } );
	};

	inputDoubleZero = () => {
		let value   = this.state.value;
		value       = ( value === '0' || value === '' ) ? '0' : value + '00';
		const error = this.checkValue( value, this.state.percentage );
		this.setState( { value, error } );
	};

	apply = () => {
		const { value, percentage, error } = this.state;
		const { onApply }                  = this.props;

		const isEmpty = value === '';

		if ( error || isEmpty ) {
			return;
		}

		onApply( parseFloat( value ), percentage );
	};

	render() {
		const { onUndo, onClickOut }       = this.props;
		const { value, percentage, error } = this.state;
		const classDiscount                = 'discount' + ( percentage ? ' active' : '' );
		const classCurrency                = 'currency' + ( percentage ? '' : ' active' );
		const classInput                   = 'input-value' + ( error ? ' error' : '' );
		const classCalculatorButtons       = 'calculator-buttons ' + ( this.withPercentage ? '' : ' noPercentage' );

		const presets = yithPosSettings.numericControllerDiscountPresets;
		return (
			<div className="calculator-wrap" onClick={onClickOut}>
				<div className="calculator" onClick={e => e.stopPropagation()}>
					<div className={classCalculatorButtons}>
						<div className="input-group">
							{this.withPercentage &&
							 <button className={classCurrency} onClick={() => this.switchMode( false )}>$</button>}
							<div className={classInput}>{value}</div>
							{this.withPercentage &&
							 <button className={classDiscount} onClick={() => this.switchMode( true )}>%</button>}
						</div>
						{this.withPercentage &&
						 <button className="undo" onClick={onUndo}><i className="yith-pos-icon-undo"/></button>}

						<button onClick={() => this.insertDigit( 1 )}>1</button>
						<button onClick={() => this.insertDigit( 2 )}>2</button>
						<button onClick={() => this.insertDigit( 3 )}>3</button>
						<button onClick={() => this.clearAll()}>C</button>
						{this.withPercentage &&
						 <button onClick={() => this.percentageDiscount( presets[ 0 ] )}>{presets[ 0 ]}%</button>}

						<button onClick={() => this.insertDigit( 4 )}>4</button>
						<button onClick={() => this.insertDigit( 5 )}>5</button>
						<button onClick={() => this.insertDigit( 6 )}>6</button>
						<button className="back" onClick={this.clearLastChar}><i className="yith-pos-icon-backspace"/>
						</button>
						{this.withPercentage &&
						 <button onClick={() => this.percentageDiscount( presets[ 1 ] )}>{presets[ 1 ]}%</button>}

						<button onClick={() => this.insertDigit( 7 )}>7</button>
						<button onClick={() => this.insertDigit( 8 )}>8</button>
						<button onClick={() => this.insertDigit( 9 )}>9</button>
						<button className="enter" onClick={this.apply}><i className="yith-pos-icon-enter"/></button>
						{this.withPercentage &&
						 <button onClick={() => this.percentageDiscount( presets[ 2 ] )}>{presets[ 2 ]}%</button>}

						<button onClick={() => this.insertDigit( 0 )}>0</button>
						<button onClick={this.inputDot}>.</button>
						<button onClick={this.inputDoubleZero}>00</button>
						{this.withPercentage &&
						 <button onClick={() => this.percentageDiscount( presets[ 3 ] )}>{presets[ 3 ]}%</button>}
					</div>
				</div>
			</div>
		)
	}
}

export default NumericController;