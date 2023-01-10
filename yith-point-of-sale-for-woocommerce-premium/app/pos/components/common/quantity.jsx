import React, { Component, Fragment } from 'react';
import { noop }                       from 'lodash';

class Quantity extends Component {

	constructor() {
		super( ...arguments );

		this.state = {
			value: parseInt( this.props.value )
		};
	}

	componentDidUpdate( prevProps ) {
		const { value } = this.props;

		if ( prevProps ) {
			if ( prevProps.value !== value ) {
				this.setState( { value: value } );
			}
		}
	}

	increase = () => {
		const { value } = this.state;
		const newValue  = this.validate( parseInt( value ) + 1 );
		this.setState( { value: newValue } );
		this.props.onChange( newValue );
	};

	decrease = () => {
		const { value } = this.state;
		const newValue  = this.validate( parseInt( value ) - 1 );
		this.setState( { value: newValue } );
		this.props.onChange( newValue );
	};

	handleChange = ( event ) => {
		const newValue = this.validate( event.target.value );
		this.setState( { value: newValue } );
		this.props.onChange( newValue );
	};

	validate = ( value ) => {
		const { max, min } = this.props;

		value = Math.max( value, min );

		if ( max ) {
			value = Math.min( value, max );
		}

		value = parseInt( value );

		return value;
	};

	render() {
		const { value }              = this.state;
		const { editable, min, max } = this.props;

		const className = 'quantity' + ( editable ? '' : ' quantity--non-editable' );

		return (
			<div className={className}>
				{
					editable
					?
					<Fragment>
						<div className="quantity__minus" onClick={( e ) => {
							e.stopPropagation();
							this.decrease();
						}}>-
						</div>
						<input type="number" className="quantity__qty" min={min} value={value} max={max || ''}
							onChange={this.handleChange} onClick={( e ) => e.stopPropagation()}/>
						<div className="quantity__plus" onClick={( e ) => {
							e.stopPropagation();
							this.increase();
						}}>+
						</div>
					</Fragment>
					:
					value
				}
			</div>
		);
	}
}

Quantity.defaultProps = {
	value   : 1,
	min     : 1,
	max     : 0,
	onChange: noop
};

export default Quantity;