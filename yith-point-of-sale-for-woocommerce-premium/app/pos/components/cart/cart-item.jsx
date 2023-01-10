/** global yithPosSettings */
import React, { Component } from 'react';
import { __ } from '@wordpress/i18n';
import { formatCurrency } from '../../packages/numbers/index.jsx';
import Quantity from '../common/quantity.jsx';
import ControlledNumber from '../common/fields/controlled-number';
import { i18n_cart_label as labels } from './config';
import { getMaxQuantity } from '../../packages/products';
import { getProductPriceToDisplay } from '../../packages/taxes';

import { applyFilters } from '@wordpress/hooks';

const CART_ITEM_PRODUCT_PRICE_FILTER = 'yith_pos_cart_item_product_price';
const CART_ITEM_PRODUCT_NAME_FILTER = 'yith_pos_cart_item_product_name';

class CartItem extends Component {
	toggleCartItemEditor = () => {
		this.props.onEditing( this.props.item.cartItemKey );
	};

	render() {
		const { item, removeCartItem, editCartItemQuantity, editCartItemNote, editCartItemPrice, resetCartItemPrice, editing, items } = this.props;

		const {
			cartItemKey,
			id,
			name,
			price,
			imageUrl,
			imageAlt,
			productType,
			qty,
			meta,
			note,
			lineSubtotal,
			lineSubtotalTax,
			lineTotal,
			lineTotalTax,
			product,
		} = item;

		const soldIndividually = item.product.sold_individually || false;

		const className = 'cart-item cart-item--' + productType + ( editing ? ' editing' : '' );
		const updateLabel = __( 'Update', 'yith-point-of-sale-for-woocommerce' );

		const _formatPrice = ( _price ) => formatCurrency( getProductPriceToDisplay( product, { price: _price } ) );
		const productPrice = applyFilters(
			CART_ITEM_PRODUCT_PRICE_FILTER,
			formatCurrency( getProductPriceToDisplay( product, { price: lineSubtotal / qty, priceIncludesTax: false } ) ),
			product,
			item,
			_formatPrice
		);

		const productName = applyFilters( CART_ITEM_PRODUCT_NAME_FILTER, name, item );

		return (
			<div className={ className } data-cart-item-key={ cartItemKey } data-product-id={ id }>
				<div className="cart-item__row" onClick={ this.toggleCartItemEditor }>
					<div
						className="cart-item__remove yith-pos-icon-clear"
						onClick={ ( e ) => {
							e.stopPropagation();
							removeCartItem( cartItemKey );
						} }
					/>
					<img src={ imageUrl } alt={ imageAlt } className="cart-item__image" />
					<i className={ 'yith-pos-icon-item-note' + ( note ? '' : ' hidden' ) } />
					<div className="cart-item__name">
						<div className="cart-item__name__title">{ productName }</div>
						{ meta && (
							<div className="cart-item__name__meta">
								{ meta.map( ( m, index ) => (
									<div key={ index } className="cart-item__name__meta__single">
										{ [ m.name, ': ', m.option ] }
									</div>
								) ) }
							</div>
						) }
					</div>
					<div className="cart-item__qty">
						<Quantity
							value={ qty }
							max={ getMaxQuantity( item, items ) }
							onChange={ ( qty ) => editCartItemQuantity( cartItemKey, qty ) }
							editable={ ! soldIndividually }
						/>
					</div>
					<div className="cart-item__price" dangerouslySetInnerHTML={ { __html: productPrice } } />
					<div className="cart-item__total">
						{ formatCurrency( getProductPriceToDisplay( product, { price: lineSubtotal, priceIncludesTax: false } ) ) }
					</div>
				</div>
				{ editing && (
					<div className="cart-item__edit">
						<div className="cart-item__edit-price">
							<div className="cart-item__edit-price__label">{ labels.changePrice }</div>
							<ControlledNumber
								value={ price }
								onChange={ ( value ) => editCartItemPrice( cartItemKey, value ) }
								onUndo={ () => resetCartItemPrice( cartItemKey ) }
							/>
						</div>
						<div className="cart-item__edit-note">
							<div className="cart-item__edit-note__label">
								<i className="yith-pos-icon-item-note" />
								{ labels.editNote }
							</div>
							<textarea row="2" onChange={ ( e ) => editCartItemNote( cartItemKey, e.currentTarget.value ) } value={ note }></textarea>
							<div className="editNoteButtonWrapper">
								<button className="button button--primary" onClick={ () => this.props.onEditing( 0 ) }>
									{ updateLabel }
								</button>
							</div>
						</div>
					</div>
				) }
			</div>
		);
	}
}

export default CartItem;
