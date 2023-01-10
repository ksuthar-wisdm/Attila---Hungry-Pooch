import React, { Component }                                                                   from 'react';
import { __ }                                                                                 from '@wordpress/i18n';
import { formatCurrency }                                                                     from '../../packages/numbers';
import { getObjectMetaData }                                                                  from '../../packages/objects';
import { getProductImageAlt, getProductImageUrl }                                             from '../../packages/products';
import { getOrderItemProductSinglePriceToDisplay, getOrderItemProductSubtotalPriceToDisplay } from '../../packages/taxes';

class OrderDetailsLineItemProduct extends Component {
	constructor() {
		super( ...arguments );

		this.state = {
			opened: false
		};
	}

	handleOpen = () => {
		const { item }   = this.props;
		const { opened } = this.state;
		const note       = getObjectMetaData( item, 'yith_pos_order_item_note' );
		if ( note ) {
			this.setState( { opened: !opened } );
		}
	};

	render() {
		const { opened }                                            = this.state;
		const { item }                                              = this.props;
		const { id, name, subtotal, quantity, price, yith_pos_image } = item;
		const note                                                  = getObjectMetaData( item, 'yith_pos_order_item_note' );
		const image                                                 = yith_pos_image;

		const style = opened ? { background: '#f4f4f4' } : {};

		const fakeProduct = { image: image };
		const imageUrl    = getProductImageUrl( fakeProduct );
		const imageAlt    = getProductImageAlt( fakeProduct );
		const mainClass   = 'yith-pos-order-details__line-item-product yith-pos-order-details__line-item--product' + ( note ? ' with-note' : '' );
		const noteLabel   = __( 'Note: ', 'yith-point-of-sale-for-woocommerce' );
		const metaData    = !!item.meta_data && item.meta_data.length ? item.meta_data.filter( _ => _.key !== 'yith_pos_order_item_note' && _.key.substr( 0, 1 ) !== '_' ) : [];

		return (
			<div className={mainClass}
				data-id={id} style={style} onClick={this.handleOpen}>
				<div className="yith-pos-order-details__item-row">
					<img src={imageUrl} alt={imageAlt} className="image"/>
					<i className={"yith-pos-icon-item-note" + ( note ? '' : ' hidden' )}/>
					<div className="name">
						<div className="order-item__name">{name}</div>
						{metaData.length > 1 && (
							<div className="order-item__meta">
								{metaData.map( ( meta ) => (
									<div key={meta.id} className="order-item__meta__single">{`${meta.display_key}: ${meta.display_value}`}</div>
								) )}
							</div>
						)}
						{opened && <div className="note"><strong>{noteLabel}</strong>{note}</div>}</div>
					<div className="quantity">{quantity}</div>
					<div className="price">{formatCurrency( getOrderItemProductSinglePriceToDisplay( item ) )}</div>
					<div className="total">{formatCurrency( getOrderItemProductSubtotalPriceToDisplay( item ) )}</div>
				</div>


			</div>
		);
	}

}

export default OrderDetailsLineItemProduct;
 