import React, { Component } from 'react';

class CartAction extends Component {

    handleClick = () =>{
        const { disabled } = this.props.action;
        if( !disabled ){
            this.props.onClick();
        }
    }

    render() {

        const { action }                           = this.props;
        const { id, icon, label, altLabel, altConditionCb, disabled } = action;

        let className = "cart-action cart-action--" + id;
        if ( icon ) {
            className += ' cart-action--with-icon';
        }

        if( disabled ){
            className += ' disabled';
        }
        let actionLabel = label;

        if ( altConditionCb && altLabel && (altConditionCb in this.props) && !!this.props[ altConditionCb ] ) {
            actionLabel = altLabel;
        }

        return (
            <div className={className}  onClick={ this.handleClick } >
                {icon && <i className={`cart-action__icon ${icon}`}/>}
                <span
                    className='cart-action__label'>{actionLabel}</span>
            </div>
        )
    }

}

export default CartAction;
