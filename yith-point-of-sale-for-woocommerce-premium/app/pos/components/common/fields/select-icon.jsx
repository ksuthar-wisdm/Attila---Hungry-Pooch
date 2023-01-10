import React, { Component } from "react";
import _                   from 'lodash';

const  setValue = ( value, options, defaultValue ) => {

        const selectedVal = ( typeof value !== 'undefined' && value !=='' ) ? value : ( ( typeof defaultValue !== '' ) ? defaultValue : '' );

        if ( selectedVal !== '' && !_.isEmpty(options) ) {

            const index = options.findIndex( ( i ) => {
                return i.key === selectedVal;
            } );
            const selectedValue = index >= 0 ? options[ index ].value : '';
            const selectedIcon = ( index >= 0 && typeof options[ index ] !== 'undefined' ) ? options[ index ].icon : '';
            const selectedIconText = ( index >= 0 && typeof options[ index ] !== 'undefined' ) ? options[ index ].iconText : '';

            return{ selectedValue, selectedIcon, selectedIconText, options } ;
        }
    }


class SelectIcon extends Component {

    constructor() {
        super( ...arguments );

        this.state = {
            dropDownOpened: false,
            selectedValue : '',
            selectedIcon  : '',
            selectedIconText  : '',
            options       : []
        }

        this.controlledModalElement = React.createRef();
    }

    componentDidMount() {
        const { value, options, defaultValue } = this.props;
        const state = setValue( value, options, defaultValue );
        this.setState( state );
        document.addEventListener( 'click', this.handleClick, true );
    }

    componentWillUnmount() {
        document.removeEventListener( 'click', this.handleClick, true );
    }

    static getDerivedStateFromProps( nextProps, prevState ){
        const { value, options, defaultValue } = nextProps;

        if( options.length > 0 ){
            return setValue( value, options, defaultValue );
        }

        return prevState;
    }


    handleClick = ( event ) => {
        const domNode = ReactDOM.findDOMNode( this );

        if ( event.keyCode === 27 || !domNode || !domNode.contains( event.target ) ) {
            this.setState( { dropDownOpened: false } );
        }
    }


    toggleDropDown = () => {
        this.setState( { dropDownOpened: !this.state.dropDownOpened } );
    }

    select = ( option ) => {
        const selectedIcon = (typeof  option.icon !== 'undefined') ? option.icon : '';
        const selectedIconText = (typeof  option.iconText !== 'undefined') ? option.iconText : '';
        this.setState( { selectedValue: option.value, selectedIcon, selectedIconText } );
        this.props.onChange( { currentTarget : { name: this.props.name, value: option.key } } );
        this.toggleDropDown();
    }

    render() {
        const { name, label, error, ...rest } = this.props;
        const { dropDownOpened, selectedValue, selectedIcon, selectedIconText, options } = this.state;
        const dropDownClass = 'dropdown-menu' + ( dropDownOpened ? ' show' : '' );
        const classGroup = "form-group form-group-" + name;
        return (


            <div className={classGroup}>
                <label htmlFor={ name }>{ label }</label>

                <div className="select-wrapper">
                    <button className="select-trigger-dropdown" onClick={ this.toggleDropDown }>
                        { ( selectedIcon !== '' && typeof selectedIcon !== 'undefined' ) && <i className={ `yith-pos-icon-${ selectedIcon }` }></i> }
                        { ( selectedIconText !== '' && typeof selectedIconText !== 'undefined' ) && <span className='yith-pos-icontext'>{selectedIconText}</span> }
                        { selectedValue }
                    </button>
                    <div className={ dropDownClass } data-selected="test1">
                        { options.length > 0 && options.map( ( option ) => {

                            return (
                                <button className="dropdown-item" key={ option.key }
                                        onClick={ () => this.select( option ) } value={ option.key }
                                        type="button">
                                    { ( typeof option.icon !== 'undefined' ) &&
                                    <i className={ `yith-pos-icon-${ option.icon }` }></i> }

                                    { ( typeof option.iconText !== 'undefined' ) &&
                                    <span className='yith-pos-icontext'>{option.iconText}</span> }


                                    { option.value }
                                </button>
                            )
                        } ) }

                    </div>
                </div>
                { error && <div className="alert alert-danger">{ error }</div> }
            </div>
        );
    }
}

export default SelectIcon;
