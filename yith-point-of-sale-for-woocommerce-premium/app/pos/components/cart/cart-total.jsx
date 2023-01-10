import React, { Component } from 'react';
import { formatCurrency }   from "../../packages/numbers";

class CartTotal extends Component {

    render() {
        const { index, total } = this.props;
        const editableClass    = total.editable ? 'editable' : '';
        const className        = `cart-total cart-total--${total.type} cart-total-${total.id} ${editableClass}`;

        const noop = () => {
        };

        let onEdit   = noop;
        let onRemove = noop;

        switch ( total.type ) {
            case 'discount':
            case 'fee':
                onEdit   = total.editable ? this.props.editFeeOrDiscount : noop;
                onRemove = total.removable ? this.props.removeFeeOrDiscount : noop;
                break;
            case 'shipping':
                onEdit   = total.editable ? this.props.editShippingMethod : noop;
                onRemove = total.removable ? this.props.removeShippingMethod : noop;
                break;
            case 'coupon':
            case 'invalid-coupon':
                onRemove = total.removable ? this.props.removeCoupon : noop;
                break;
        }


        return (
            <div key={index} className={className}>
                {total.removable && <div className="cart-total__remove yith-pos-icon-clear"
                                         onClick={() => onRemove( total.key )}/>}
                <div className="cart-total__label"
                     onClick={() => onEdit( total.key )}>{total.label}</div>
                <div className="cart-total__price">{formatCurrency( total.price )}</div>
            </div>
        )
    }

}

export default CartTotal;