import React, { Component, Fragment } from "react";
import { __ }                         from "@wordpress/i18n";
import { formatCurrency }             from '../../../packages/numbers';
import { noop }                       from 'lodash';
import Quantity                       from '../quantity';

class NumericRegisterController extends Component {

    constructor() {
        super( ...arguments );

        const { amount: value, percentage } = this.props.data;

        this.state = {
            value     : String( value ),
            percentage: percentage
        };
    }

    componentDidMount() {
        const { amount: value, percentage } = this.props.data;
        this.setState( { value, percentage } );
        document.addEventListener( 'keydown', this.handleKeyDown, true );
    }

    componentWillUnmount() {
        document.removeEventListener( 'keydown', this.handleKeyDown, true );
    }

    componentDidUpdate( prevProps, prevState ) {
        const { value, percentage }                            = this.state;
        const { amount: propValue, percentage: newPercentage } = this.props.data;
        if ( prevState.value !== value || prevState.percentage !== percentage ) {
            this.props.onChange( value, percentage );
        } else if ( newPercentage !== percentage || propValue != value ) {
            //update the status if something changes on data
            this.setState( { value: propValue, percentage: newPercentage } );
        }

    }

    insertPreset = ( value ) => {
        this.setState( { value, percentage: !!this.props.presetsAsPercentage } );
    }

    handleKeyDown = ( e ) => {
        const { key, target } = e;

        if ( target.tagName.toUpperCase() === 'INPUT' && !target.readOnly ) {
            return;
        }

        if ( ( /\d/ ).test( key ) ) {
            this.insertDigit( parseInt( key, 10 ) );
        } else if ( key === 'Backspace' ) {
            this.clearLastChar();
        } else if ( key === 'Enter' ) {
            this.props.onSubmit();
        } else if ( key === '.' || key === ',' ) {
            this.inputDot();
        }
    };

    clearAll = () => {
        this.setState( { value: '0' } );
    };

    clearLastChar = () => {
        let { value } = this.state;
        value         = String( value );
        value         = value.length > 1 ? value.substring( 0, value.length - 1 ) : '0';
        this.setState( { value } );
    };

    insertDigit = ( digit ) => {
        let { value } = this.state;

        value = ( value === '0' ) ? digit.toString() : value + digit.toString();

        this.setState( { value } );
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
        let value = this.state.value;
        value     = ( value === '0' ) ? '0' : value + '00';
        this.setState( { value } );
    };

    render() {
        const { labelPresets, backLabel, presets, presetsAsPercentage, submitLabel, onUndo, onSubmit } = this.props;

        return (
            <div className="numeric-register-controller">
                {presets.length > 0 &&
                 <Fragment>
                     <div className="labelPresets">{labelPresets}</div>
                     <div className="presets-buttons">
                         {presets.map( ( preset, index ) => {
                             const presetValue = !!presetsAsPercentage ? preset + '%' : formatCurrency( preset );
                             return ( <button key={index}
                                              onClick={() => this.insertPreset( preset )}>{presetValue}</button> )
                         } )}
                     </div>
                 </Fragment>
                }
                <div className="calculator-buttons">
                    <button onClick={() => this.insertDigit( 1 )}>1</button>
                    <button onClick={() => this.insertDigit( 2 )}>2</button>
                    <button onClick={() => this.insertDigit( 3 )}>3</button>
                    <button className="large" onClick={() => this.clearAll()}><small>{__( 'clear', 'yith-point-of-sale-for-woocommerce' )}</small></button>


                    <button onClick={() => this.insertDigit( 4 )}>4</button>
                    <button onClick={() => this.insertDigit( 5 )}>5</button>
                    <button onClick={() => this.insertDigit( 6 )}>6</button>
                    <button className="back large" onClick={this.clearLastChar}><i
                        className="yith-pos-icon-backspace"/>
                    </button>

                    <button onClick={() => this.insertDigit( 7 )}>7</button>
                    <button onClick={() => this.insertDigit( 8 )}>8</button>
                    <button onClick={() => this.insertDigit( 9 )}>9</button>
                    <button className="submit-button large" onClick={onSubmit}>{submitLabel}</button>

                    <button onClick={() => this.insertDigit( 0 )}>0</button>
                    <button onClick={this.inputDot}>.</button>
                    <button onClick={this.inputDoubleZero}>00</button>
                    <button className="undo large" onClick={onUndo}>{backLabel}</button>
                </div>
            </div>
        )
    }
}

NumericRegisterController.defaultProps = {
    presetsAsPercentage: false,
    onUndo             : noop,
    onSubmit           : noop,
    presets            : []
};

export default NumericRegisterController;