import React, { Component } from 'react';
import { noop }             from 'lodash';

import { __ } from '@wordpress/i18n';

import CartItem                                      from './cart/cart-item.jsx';
import CartAction                                    from './cart/cart-action.jsx';
import CartTotal                                     from './cart/cart-total.jsx';
import { cartActions, cartButtons, i18n_cart_label } from './cart/config.jsx';
import CartNoteBox                                   from "./cart/cart-note-box";
import Nav                                           from "./common/nav";
import CartSavedList                                 from "./cart/cart-saved-list";
import { getCustomerFullName, getCustomerPoints }    from '../packages/customers';


class Cart extends Component {

	constructor() {
		super( ...arguments );

		this.state = {
			cartItemEditing : '',
			savedCartEditing: ''
		}

		this.references = {
			list: React.createRef()
		};


	}

	componentDidUpdate( prevProps, prevState ) {
		if ( prevProps.items.length + 1 === this.props.items.length ) {
			// scroll to bottom on adding a new item
			this.references.list.current.scrollTop = this.references.list.current.scrollHeight;

		}
	}

	onEditing = ( cartItemKey ) => {
		const cartItemEditing = ( cartItemKey === this.state.cartItemEditing ) ? 0 : cartItemKey;
		this.setState( { cartItemEditing } );
	};

	onEditingSavedCart = ( cart_id ) => {
		const savedCartEditing = ( cart_id === this.state.savedCartEditing ) ? 0 : cart_id;
		this.setState( { savedCartEditing } );
	};

	render() {
		const {
				  customer,
				  items,
				  note,
				  totals,
				  removeCartItem,
				  editCartItemQuantity,
				  editCartItemNote,
				  editCartItemPrice,
				  resetCartItemPrice,
				  removeFeeOrDiscount,
				  editFeeOrDiscount,
				  editShippingMethod,
				  removeShippingMethod,
				  removeCoupon,
				  editCartNote,
				  onAction,
				  showSavedCarts,
				  savedCartAction,
				  savedCarts,
				  editSavedCartNote,
				  isCartEmpty,
				  /* Added by WisdmLabs */
				  editRedeemPoints
				  /* Added by WisdmLabs */
			  } = this.props;

		const isGuest        = !customer?.id;
		const noteTitle      = __( 'Note', 'yith-point-of-sale-for-woocommerce' );
		const cartItemsClass = "cart-items" + ( items.length === 0 ? " empty-cart" : "" );
		const labelEmptyCart = ( items.length === 0 ? __( 'Add the first product to the cart', 'yith-point-of-sale-for-woocommerce' ) : '' );

		let cartNavItems = [
			{ key: 'cart', label: i18n_cart_label.cart, icon: 'cart', active: !showSavedCarts, onClick: () => onAction( 'cart' ) },
			{ key: 'customer', label: i18n_cart_label.customer, description: getCustomerFullName( customer ), icon: 'customer', active: false, onClick: () => onAction( 'customer' ) },
			{ key: 'address', label: i18n_cart_label.address, icon: 'location', active: false, onClick: () => onAction( 'address' ) },
			/* Addec by WisdmLabs */
			{ key: 'customer-points', label: i18n_cart_label.points, description: getCustomerPoints( customer ), icon: 'coin', active: false },
			/* Addec by WisdmLabs */
			{ key: 'saved-carts', label: '', icon: 'saved-cart', active: showSavedCarts, enabled: !!savedCarts.length, onClick: () => onAction( 'saved-carts' ) }
		];

		if ( ! isGuest ) {
			cartNavItems = cartNavItems.filter( _ => _.key !== 'address' );
		}
		/* Addec by WisdmLabs */
		else {
			cartNavItems = cartNavItems.filter( _ => _.key !== 'customer-points' );
		}
		/* Addec by WisdmLabs */

		return (

			<div className="yith-pos-cart">

				<Nav items={cartNavItems} onAction={onAction} className="yith-pos-cart__buttons"/>

				{showSavedCarts && <CartSavedList carts={savedCarts} savedCartAction={savedCartAction}
					onEditing={this.onEditingSavedCart}
					editing={this.state.savedCartEditing}
					editSavedCartNote={editSavedCartNote}/>}


				{!showSavedCarts && <div className={cartItemsClass} ref={this.references.list}>
					<div className="cart-empty-box">
						<div className="cart-empty-svg"/>
						<span>{labelEmptyCart}</span></div>
					{items.map( ( item, index ) => {
						const editing = ( item.cartItemKey === this.state.cartItemEditing );

						return (
							<CartItem key={item.cartItemKey} item={item} removeCartItem={removeCartItem}
								editCartItemQuantity={editCartItemQuantity}
								editCartItemNote={editCartItemNote}
								editCartItemPrice={editCartItemPrice} resetCartItemPrice={resetCartItemPrice}
								onEditing={this.onEditing} editing={editing} items={items}/>
						)
					} )}
				</div>
				}

				{!showSavedCarts && <div className="cart-totals">
					{totals.map( ( total, index ) => {
						return ( <CartTotal key={index} total={total} index={index}
							removeFeeOrDiscount={removeFeeOrDiscount}
							editFeeOrDiscount={editFeeOrDiscount}
							/* Added by WisdmLabs */
							editRedeemPoints={editRedeemPoints}
							/* Added by WisdmLabs */
							removeShippingMethod={removeShippingMethod}
							editShippingMethod={editShippingMethod} removeCoupon={removeCoupon}/> )
					} )}
				</div>}

				{!showSavedCarts &&
				 <CartNoteBox note={note} editCartNote={editCartNote} noteTitle={noteTitle}/>}

				{!showSavedCarts && <div className="cart-actions">
					{cartActions.map( ( action ) => {
						const actionOnClickHandler = action.onClickHandler && action.onClickHandler in this.props ?
													this.props[ action.onClickHandler ] :
													noop;

						if ( action.id === 'empty-cart' && isCartEmpty ) {
							return null;
						}

						if ( action.id === 'suspend-and-save-cart' || action.id === 'pay' ) {
							action.disabled = ( items.length === 0 );
						}

						/* Added by WisdmLabs */
						if ( action.id === 'redeem-points' ) {
							let pointsAdded = false;
							this.props.totals.map( ( total, i ) => {
								if ( total.label.toString().toLowerCase().includes( 'points redeemed' ) ) {
									pointsAdded = true;
								}
							} );
							action.disabled = isGuest || pointsAdded;
						}
						/* Added by WisdmLabs */

						return (
							<CartAction key={action.id} action={action} onClick={actionOnClickHandler}/>
						)
					} )}
				</div>}

			</div>
		);
	}

}

export default Cart;
