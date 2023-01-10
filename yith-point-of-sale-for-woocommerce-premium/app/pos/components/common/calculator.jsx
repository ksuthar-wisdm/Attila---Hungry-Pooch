import React, { Component } from "react";
import _                    from 'lodash';
import Icon                 from '../../packages/components/icon';

const CalculatorOperations = {
    '/': ( prevValue, nextValue ) => prevValue / nextValue,
    '*': ( prevValue, nextValue ) => prevValue * nextValue,
    '+': ( prevValue, nextValue ) => prevValue + nextValue,
    '-': ( prevValue, nextValue ) => prevValue - nextValue,
    '=': ( prevValue, nextValue ) => nextValue
}

class Calculator extends Component {
    constructor() {
        super( ...arguments );
        this.state = {
            value            : null,
            displayValue     : '0',
            waitingForOperand: false,
            operator         : null,
            history          : [ 0 ],
            opened           : false,
            error            : false
        };
    }

    componentDidMount() {
        const { opened } = this.state;
        opened && document.addEventListener( 'keydown', this.handleKeyDown )
    }

    componentDidUpdate( prevProps, prevState, snapshot ) {
        if( prevState.opened !== this.state.opened ){
            if( this.state.opened) {
                document.addEventListener( 'keydown', this.handleKeyDown );
            } else{
                document.removeEventListener( 'keydown', this.handleKeyDown );
            }
        }
    }


    handleKeyDown = ( event ) => {
        event.preventDefault();
        let { key, target } = event;

        if ( key === 'Enter' )
            key = '='

        if ( ( /\d/ ).test( key ) ) {
            this.insertDigit( parseInt( key, 10 ) );
        } else if ( key in CalculatorOperations ) {
            this.doOperation( key );
        } else if ( key === '.' ) {
            this.inputDot();
        } else if ( key === 'Backspace' ) {
            this.clearLastChar();
        } else if ( key === 'Clear' ) {
            if ( this.state.value !== '0' ) {
                this.clearDisplay()
            } else {
                this.clearAll()
            }
        }
    };

    clearDisplay = () => {
        let { history }               = this.state;
        history[ history.length - 1 ] = 0;
        this.setState( { displayValue: '0' } );
    }

    clearAll = () => {
        this.setState( {
            value            : null,
            displayValue     : '0',
            waitingForOperand: false,
            operator         : null,
            history          : [ 0 ],
            opened           : true
        } );
    };


    clearLastChar = () => {
        let { displayValue, history }     = this.state;
        displayValue                      = displayValue.length > 1 ? displayValue.substring( 0, displayValue.length - 1 ) : '0';
        history[ ( history.length - 1 ) ] = displayValue;
        this.setState( { displayValue, history } );
    };

    insertDigit = ( digit ) => {
        let { displayValue, history, waitingForOperand } = this.state;
        const last                                       = history[ history.length - 1 ];
        const oldDisplayValue                            = displayValue;

        if ( waitingForOperand ) {
            if ( history.length === 1 ) {
                digit   = ( digit === '00' ) ? 0 : digit;
                history = [ String( digit ) ];
            } else {

                if ( last in CalculatorOperations ) {
                    if ( digit === '00' ) {
                        history.push( '0' );
                    } else {
                        history.push( String( digit ) );
                    }

                } else {
                    history[ history.length - 1 ] = last + String( digit );
                }
            }

            displayValue = digit === '00' ? 0 : String( digit );

            waitingForOperand = false;


        } else {

            if ( digit === '00' && ( ( last in CalculatorOperations ) || last == 0 ) ) {
                return;
            }

            const dv = ( displayValue == '0' ) ? String( digit ) : displayValue + digit;

            if ( history.length === 1 && history[ 0 ] == 0 ) {
                history = [ dv ];
            } else {
                const last = history[ history.length - 1 ];
                if ( last in CalculatorOperations ) {
                    history.push( String( digit ) );
                } else {
                    history[ history.length - 1 ] = ( last == '0' ) ? String( digit ) : ( last + String( digit ) );
                }
            }

            displayValue = dv;
        }

        displayValue                  = displayValue.length > 16 ? oldDisplayValue : displayValue;
        history[ history.length - 1 ] = displayValue;

        this.setState( {
            displayValue,
            waitingForOperand,
            history
        } )
    };

    inputDot = () => {
        let { displayValue, history, waitingForOperand } = this.state;

        if ( !( /\./ ).test( displayValue ) || waitingForOperand ) {
            const last = history[ history.length - 1 ];

            if ( last in CalculatorOperations ) {
                history.push( '0.' );
                displayValue = 0;
            } else {
                history[ history.length - 1 ] = last + '.';
            }
            this.setState( {
                displayValue     : displayValue + '.',
                waitingForOperand: false,
                history
            } )
        }
    };

    open = () => {
        const { opened } = this.state;
        var element = document.getElementById("pos-shadow");
        if( !opened ){
          element.classList.add("active");
          element.classList.add("extended");
        }else{
          element.classList.remove("active");
          element.classList.remove("extended");
        }

        this.clearAll();
        this.setState( { opened: !opened } );
    }

    doOperation = ( operation ) => {
        const { value, operator }     = this.state;
        let { history, displayValue } = this.state;
        const inputValue              = parseFloat( displayValue );
        const last                    = history[ history.length - 1 ];

        if ( operation !== '=' && last in CalculatorOperations ) {
            history[ history.length - 1 ] = operation;
            this.setState( {
                history,
                waitingForOperand: true,
                operator         : operation
            } );
            return;
        }

        if ( value == null ) {
            if ( operation !== '=' ) {
                last !== 0 && history.push( operation );
            } else {
                if ( last in CalculatorOperations ) {
                    history.push( inputValue );
                } else {
                    history = [ displayValue ];
                }
            }

            this.setState( {
                value: inputValue,
                history
            } )
        } else if ( operator ) {
            const currentValue = value || 0;
            const newValue     = CalculatorOperations[ operator ]( currentValue, inputValue );

            displayValue = operation !== '=' ? displayValue : String( newValue );

            if ( operation !== '=' ) {
                history.push( operation );
            } else {
                history = [ displayValue ];
            }


            this.setState( {
                value       : newValue,
                displayValue: displayValue,
                history
            } );
        }

        this.setState( {
            waitingForOperand: true,
            operator         : operation
        } )
    }


    render() {

        const { opened, displayValue, history } = this.state;
        const className                         = 'yith-pos-calculator-box' + ( opened ? '' : ' hide' );
        const wrapperClass                      = 'yith-pos-calculator-wrapper' + ( opened ? ' active' : '' );
        const displayHistory                    = _.isArray( history ) ? history.join( '' ) : '';
        return (
            <div className={ wrapperClass } id="calculator">
                <a className="yith-pos-calculator-button" onClick={ this.open }>
                    <span className="yith-pos-icon-calculator"/>
                </a>


                <div className={ className }>
                    <div className="yith-pos-calculator">
                        <div className="calculator-buttons">
                            <div className="input-group">
                                <input className="history" type="text" value={ displayHistory } disabled={ true }/>
                                <div className="currentValue">{ displayValue }</div>
                            </div>
                            <button className="undo" onClick={ () => this.clearDisplay() }><Icon icon="undo" /></button>

                            <button onClick={ () => this.insertDigit( 1 ) }>1</button>
                            <button onClick={ () => this.insertDigit( 2 ) }>2</button>
                            <button onClick={ () => this.insertDigit( 3 ) }>3</button>
                            <button onClick={ () => this.clearAll() }>C</button>
                            <button onClick={ () => this.doOperation( '+' ) }>+</button>

                            <button onClick={ () => this.insertDigit( 4 ) }>4</button>
                            <button onClick={ () => this.insertDigit( 5 ) }>5</button>
                            <button onClick={ () => this.insertDigit( 6 ) }>6</button>
                            <button className="back" onClick={ () => this.clearLastChar() }><i
                                className="yith-pos-icon-backspace"/>
                            </button>
                            <button onClick={ () => this.doOperation( '-' ) }>-</button>


                            <button onClick={ () => this.insertDigit( 7 ) }>7</button>
                            <button onClick={ () => this.insertDigit( 8 ) }>8</button>
                            <button onClick={ () => this.insertDigit( 9 ) }>9</button>
                            <button className="enter" onClick={ () => this.doOperation( '=' ) }>=</button>
                            <button onClick={ () => this.doOperation( '*' ) } className="multiplication">x</button>

                            <button onClick={ () => this.insertDigit( 0 ) }>0</button>
                            <button onClick={ () => this.inputDot() }>.</button>
                            <button onClick={ () => this.insertDigit( '00' ) }>00</button>
                            <button onClick={ () => this.doOperation( '/' ) }> &divide;</button>
                        </div>
                    </div>
                </div>

            </div>
        )
    }

}

export default Calculator;
