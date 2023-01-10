import React, { Component, Fragment } from "react";
import NumericController              from './numeric-controller';
import { numberFormat }               from '../../../packages/numbers';

class ControlledNumber extends Component {

    constructor() {
        super( ...arguments );
        this.state = {
            value  : this.props.value,
            editing: false
        };

    }

    static formatPrice = ( price ) => {
        return numberFormat( price, yithPosSettings.wc.currency.precision );
    };

    componentDidUpdate( prevProps, prevState ) {
        if ( prevProps.value !== this.props.value ) {
            this.setState( { value: this.props.value } );
        }
    }

    open = () => {
        this.setState( { editing: true } );
    };

    close = () => {
        this.setState( { editing: false } );
    };

    onChange = ( _value, percentage ) => {
        const { value } = this.state;
        if ( percentage ) {
            _value = value - value * _value / 100;
        }

        const { onChange } = this.props;
        this.setState( { value: _value } );
        onChange( _value );
        this.close();
    };

    render() {
        const { value, editing } = this.state;
        const { onChange, onUndo, withPercentage, error, ...rest } = this.props;

        const inputClass = 'controlled-number-input' + ( error ? ' controlled-number-input-with-errors' : '');
        return (
            <div className="cart-item__edit-price-input-wrapper">
                <input { ...rest } className={inputClass} value={ ControlledNumber.formatPrice(value) } readOnly onClick={ this.open }/>
                {error && <div className="alert alert-danger">{error}</div>}
                { editing &&
                <NumericController initialValue={ value } onApply={ this.onChange } onUndo={ onUndo }
                                   onClickOut={ this.close } withPercentage = { withPercentage }/>  }
            </div>
        );
    }
}

export default ControlledNumber;
