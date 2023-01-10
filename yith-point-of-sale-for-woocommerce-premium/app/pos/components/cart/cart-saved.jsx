import React                         from 'react';
import { i18n_cart_label as labels } from "./config";
import { formatCurrency }            from '../../packages/numbers';
import { getCustomerFullName }       from "../../packages/customers";
import { CartManager }               from "../../packages/cart-manager";
import ControlledNumber              from "../common/fields/controlled-number";

const CartSaved = ( props ) => {

    const toggleCartItemEditor = () => {
        props.onEditing( props.cart.id );
    };

    const {cart, savedCartAction, editing, editSavedCartNote } = props;
    const cartManager = new CartManager( cart );
    const total       = cartManager.getTotal('total');
    const { saveReasonNote, customer, cartItems } = cart;
    const customerLabel = labels.byPrefix + ' ' + ( customer.id === 0 ? labels.customerGuest :  getCustomerFullName(customer) );
    const numOfProducts =  cartItems.length + ' ' + (cartItems.length > 1 ? labels.productPlural : labels.productSingular);
    const className = "yith-pos-cart__savedcart " + ( editing ? " editing" : "" );

    return(
        <div className={className} data-cart-saved-id={cart.id}>
            <div className="cart-saved__row" onClick={() => toggleCartItemEditor()}>
                <div className="cart-saved__remove yith-pos-icon-clear" onClick={( e ) => {
                    e.stopPropagation();
                    savedCartAction( cart, 'remove' );
                }}/>
                <div className="saved-cart-img"><i className="yith-pos-icon-saved-cart"></i></div>
                <i className={"yith-pos-icon-item-note" + ( saveReasonNote ? '' : ' hidden' )}/>

                <div className="cart-saved__name">
                    <div className="cart-saved__name__id">#{cart.id}</div>
                    <div className="cart-saved__name__customer">{customerLabel}</div>
                </div>

                <div className="cart-saved__num_of_items">{numOfProducts}</div>
                <div className="cart-saved__status">{labels.pendingPayment}</div>

                <div className="cart-saved__total">{formatCurrency(total)}</div>

                <button className="button button--primary" onClick={( e ) => {
                    e.stopPropagation();
                    savedCartAction( cart, 'reload' );
                }}><i className="yith-pos-icon-refresh" /> {labels.load}</button>
            </div>
            {editing &&
            <div className="cart-saved__edit">
                <div className="cart-saved__edit-note">
                    <div className="cart-saved__edit-note__label">
                        <i className="yith-pos-icon-item-note"/>
                        {labels.editNote}
                    </div>
                    <input type="text" value={saveReasonNote}
                           onChange={e => editSavedCartNote( cart.id, e.currentTarget.value )}/>
                </div>
            </div>
            }
        </div>
    )
}

export default CartSaved;

