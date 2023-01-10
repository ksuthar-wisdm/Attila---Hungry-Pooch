/** global yithPosSettings */
import React, { Component, Fragment } from 'react';
import ReactDOM                       from 'react-dom';
import { __, sprintf }                from '@wordpress/i18n';
import { dateI18n }                   from '@wordpress/date';
import { applyFilters }               from '@wordpress/hooks';
import _                              from 'lodash';
import classNames                     from 'classnames';

import { getReceipt }                                        from '../../packages/objects/receipt';
import store                                                 from '../../packages/objects/store';
import { formatCurrency }                                    from '../../packages/numbers';
import {
	getOrderCouponDiscountPriceToDisplay,
	getOrderItemProductSubtotalPriceToDisplay,
	getOrderShippingLineTotalPriceToDisplay,
	taxEnabled
}                                                            from '../../packages/taxes';
import { getCustomerFullName }                               from '../../packages/customers';
import { getOrderFormattedDateTime, getOrderPaymentDetails } from '../../packages/orders';
import { formatAddress }                                     from '../../packages/utils';
import { getObjectMetaData }                                 from '../../packages/objects';
import { isPosDiscountCouponCode }                           from '../../packages/data';

const RECEIPT_ORDER_ITEM_PRICE_FILTER         = 'yith_pos_receipt_order_item_price';
const RECEIPT_ORDER_ITEM_NAME_QUANTITY_FILTER = 'yith_pos_receipt_order_item_name_quantity';
const RECEIPT_SHOW_ORDER_NOTE_FILTER          = 'yith_pos_receipt_show_order_note';
const RECEIPT_BEFORE_TAX_LINE_FILTER          = 'yith_pos_receipt_before_tax_line';
const RECEIPT_ORDER_DATA_ELEMENTS_FILTER      = 'yith_pos_receipt_order_data_elements';
const RECEIPT_AFTER_COUPONS_FILTER            = 'yith_pos_receipt_after_coupons';
const RECEIPT_SHOW_ORDER_ITEM_NOTE_FILTER     = 'yith_pos_receipt_show_order_item_note';

class OrderReceiptPrint extends Component {

	constructor( props ) {
		super( props );

		this.receipt = getReceipt();
		this.receipt.setOrder( props.order );
	}

	_getElement = ( element ) => {
		const defaultElement = { id: '', show: false, value: '', type: 'text', label: '' };
		element              = Object.assign( {}, defaultElement, element );
		let el               = <Fragment/>;
		if ( element.show ) {
			switch ( element.type ) {
				case 'image':
					el = <img className="element-value element-value--image" src={element.value}/>;
					break;
				case 'html':
					el = <span className="element-value element-value--html" dangerouslySetInnerHTML={{ __html: element.value }}/>;
					break;
				case 'text':
					el = <span className="element-value element-value--text">{element.value}</span>;
					break;
			}
		}

		return (
			element.show && (
				<div key={element.id} className={`${element.id} element-type--${element.type}`}>
					{element.label && <span className="element-label">{element.label}</span>}
					{el}
				</div>
			)
		);
	};

	getReceiptHeader = () => {
		const elements = [
			{ id: 'logo', show: this.receipt.getLogo(), value: this.receipt.getLogo(), type: 'image' },
			{ id: 'store-name', show: this.receipt.showStoreName(), value: store.getName() },
			{ id: 'store-vat', show: this.receipt.showVat(), value: store.getVatNumber(), label: this.receipt.getVatLabel() },
			{ id: 'store-address', show: this.receipt.showAddress(), value: store.getFormattedAddress(), type: 'html' },
			{ id: 'store-phone', show: this.receipt.showPhone(), value: store.getPhone(), label: __( 'Phone:', 'yith-point-of-sale-for-woocommerce' ) },
			{ id: 'store-email', show: this.receipt.showEmail(), value: store.getEmail(), label: __( 'Email:', 'yith-point-of-sale-for-woocommerce' ) },
			{ id: 'store-fax', show: this.receipt.showFax(), value: store.getFax(), label: __( 'Fax:', 'yith-point-of-sale-for-woocommerce' ) },
			{
				id   : 'store-website',
				show : this.receipt.showWebsite(),
				value: store.getWebsite(),
				label: __( 'Web:', 'yith-point-of-sale-for-woocommerce' )
			},
			{
				id   : 'store-facebook',
				show : this.receipt.showFacebook(),
				value: store.getFacebook(),
				label: __( 'Facebook:', 'yith-point-of-sale-for-woocommerce' )
			},
			{
				id   : 'store-twitter',
				show : this.receipt.showTwitter(),
				value: store.getTwitter(),
				label: __( 'Twitter:', 'yith-point-of-sale-for-woocommerce' )
			},
			{
				id   : 'store-instagram',
				show : this.receipt.showInstagram(),
				value: store.getInstagram(),
				label: __( 'Instagram:', 'yith-point-of-sale-for-woocommerce' )
			},
			{
				id   : 'store-youtube',
				show : this.receipt.showYoutube(),
				value: store.getYoutube(),
				label: __( 'Youtube:', 'yith-point-of-sale-for-woocommerce' )
			}
		];

		return <Fragment>{elements.map( ( element ) => this._getElement( element ) )}</Fragment>;
	};

	getOrderLines = () => {
		const { order, isGift } = this.props;
		const priceInclTax      = !taxEnabled() || this.receipt.showPricesIncludingTax();
		const showTaxRow        = taxEnabled() && this.receipt.showTaxDetails();
		const showItemizedTax   = this.receipt.showItemizedTax();
		const paymentDetails    = getOrderPaymentDetails( order );
		const showOrderItemNote = !!applyFilters( RECEIPT_SHOW_ORDER_ITEM_NOTE_FILTER, false, { receipt: this.receipt, order } );
		const showSku           = !!this.receipt.showSku();
		const skuLabel          = this.receipt.getSkuLabel();

		return (
			<Fragment>
				<div className="receipt__order-items">
					{order.line_items.map( ( item ) => {
						const productPrice        = applyFilters(
							RECEIPT_ORDER_ITEM_PRICE_FILTER,
							formatCurrency( getOrderItemProductSubtotalPriceToDisplay( item, priceInclTax ) ),
							item,
							formatCurrency
						);
						const productNameQuantity = applyFilters(
							RECEIPT_ORDER_ITEM_NAME_QUANTITY_FILTER,
							sprintf( '%s x %s', item.quantity, item.name ),
							item
						);
						const metaData            = !!item.meta_data && item.meta_data.length ? item.meta_data.filter( _ => _.key !== 'yith_pos_order_item_note' && _.key.substr( 0, 1 ) !== '_' ) : [];
						const itemNote            = showOrderItemNote ? getObjectMetaData( item, 'yith_pos_order_item_note' ) : false;

						return (
							<div className="receipt__order-line receipt__order-line--item" key={item.id}>
								<div className="line-name">
									<div className="order-item__name">{productNameQuantity}</div>
									{showSku && item?.sku && <div className="order-item__sku">{[skuLabel, item.sku].filter( _ => !!_ ).join( ' ' )}</div>}
									{metaData.length > 1 && (
										<div className="order-item__meta">
											{metaData.map( ( meta ) => (
												<div key={meta.id} className="order-item__meta__single">{`${meta.display_key}: ${meta.display_value}`}</div>
											) )}
										</div>
									)}
									{!!itemNote && <div className="order-item__note">{itemNote}</div>}
								</div>

								{!isGift && <div className="line-price">{productPrice}</div>}
							</div>
						);
					} )}
				</div>

				{!isGift && <div className="receipt__order-coupons">
					{order.coupon_lines.map( ( item ) => {
						let label = __( 'COUPON', 'yith-point-of-sale-for-woocommerce' ) + ' - ' + item.code;

						if ( isPosDiscountCouponCode( item.code ) ) {
							label = [
								__( 'Discount', 'yith-point-of-sale-for-woocommerce' ),
								getObjectMetaData( item, 'coupon_data' )?.description
							].filter( _ => _ ).join( ' - ' )
						}

						return (
							<div className="receipt__order-line receipt__order-line--coupon" key={item.id}>
								<div className="line-name">{label}</div>
								<div className="line-price">{formatCurrency( getOrderCouponDiscountPriceToDisplay( item, priceInclTax ) * -1 )}</div>
							</div>
						);
					} )}
				</div>}

				{applyFilters( RECEIPT_AFTER_COUPONS_FILTER, false, { order, receipt: this.receipt, isGift } )}

				<div className="receipt__order-shipping">
					{order.shipping_lines.map( ( item ) => {
						return (
							<div className="receipt__order-line receipt__order-line--shipping" key={item.id}>
								<div className="line-name">{item.method_title}</div>
								<div className="line-price">{formatCurrency( getOrderShippingLineTotalPriceToDisplay( item, priceInclTax ) )}</div>
							</div>
						);
					} )}
				</div>

				{!isGift && <div className="receipt__order-totals">
					{applyFilters( RECEIPT_BEFORE_TAX_LINE_FILTER, false, order, { formatCurrency }, this.receipt )}

					{showTaxRow && (
						!showItemizedTax ?
						<div className="receipt__order-line receipt__order-line--total-tax">
							<div className="line-name">{__( 'Tax', 'yith-point-of-sale-for-woocommerce' )}</div>
							<div className="line-price">{formatCurrency( order.total_tax )}</div>
						</div> :
						order.tax_lines.map( ( item ) => {
							return (
								<div key={item.id} className="receipt__order-line receipt__order-line--total-tax receipt__order-line--total-tax--itemized">
									<div className="line-name">{item.label}</div>
									<div className="line-price">{formatCurrency( item.tax_total )}</div>
								</div>
							);
						} )
					)}

					{order.fee_lines.map( ( item ) => {
						const type = item.total > 0 ? 'fee' : 'discount';
						return (
							<div className={`receipt__order-line receipt__order-line--${type}`} key={item.id}>
								<div className="line-name">{item.name}</div>
								<div className="line-price">{formatCurrency( item.total )}</div>
							</div>
						);
					} )}

					<div className="receipt__order-line receipt__order-line--total">
						<div className="line-name">{__( 'Total', 'yith-point-of-sale-for-woocommerce' )}</div>
						<div className="line-price">{formatCurrency( order.total )}</div>
					</div>

					{paymentDetails && paymentDetails.map( ( detail ) => {
						return (
							<div
								key={detail.key}
								className={`receipt__order-line receipt__order-line--payment-detail receipt__order-line--payment-detail--${detail.type}`}
							>
								<div className="line-name">{detail.name}</div>
								<div className="line-price">{formatCurrency( detail.amount )}</div>
							</div>
						)
					} )}

				</div>}
			</Fragment>
		);
	};

	getOrderNote = () => {
		const { customer_note } = this.props.order;

		return (
			customer_note &&
			<div className="receipt__order-note">
				{this._getElement( {
									   id   : 'order-note',
									   show : true,
									   value: customer_note,
									   label: __( 'Note:', 'yith-point-of-sale-for-woocommerce' )
								   } )}
			</div>
		);
	};

	getOrderData = () => {
		const { order } = this.props;

		let customer = getCustomerFullName( order.billing );
		if ( !customer.length ) {
			customer = !!order.customer_id ? `#${order.customer_id}` : __( 'Guest', 'yith-point-of-sale-for-woocommerce' );
		}

		const { register_name, cashier_name } = order.yith_pos_data || { register_name: '', cashier_name: '' };

		const elements = applyFilters( RECEIPT_ORDER_DATA_ELEMENTS_FILTER, [
			{
				id   : 'order-date',
				show : this.receipt.showOrderDate(),
				value: getOrderFormattedDateTime( order ),
				label: this.receipt.getOrderDateLabel()
			},
			{ id: 'order-number', show: this.receipt.showOrderNumber(), value: order.number, label: this.receipt.getOrderNumberLabel() },
			{ id: 'order-customer', show: this.receipt.showOrderCustomer(), value: customer, label: this.receipt.getOrderCustomerLabel() },
			{ id: 'order-shipping', show: this.receipt.showShipping(), value: formatAddress( order.shipping ), label: this.receipt.getShippingLabel() },
			{
				id   : 'order-register-name',
				show : this.receipt.showOrderRegister() && register_name,
				value: register_name,
				label: this.receipt.getOrderRegisterLabel()
			},
			{ id: 'order-cashier-name', show: this.receipt.showCashier() && cashier_name, value: cashier_name, label: this.receipt.getCashierLabel() }
		], order );

		return <Fragment>{elements.map( ( element ) => this._getElement( element ) )}</Fragment>;
	};

	getReceiptFooter = () => {
		return this.receipt.getReceiptFooter();
	};

	render() {
		const { order, isGift } = this.props;

		const showOrderNote = applyFilters( RECEIPT_SHOW_ORDER_NOTE_FILTER, true, order, this.receipt, isGift );
		const classes       = classNames(
			'receipt',
			'printable',
			{
				'gift': isGift
			}
		);

		return !!order ? ReactDOM.createPortal(
						   <div id="order-receipt-print" className={classes}>
							   <div className="receipt__header">{this.getReceiptHeader()}</div>
							   <div className="receipt__order-lines">{this.getOrderLines()}</div>
							   {showOrderNote && <div className="receipt__order-notes">{this.getOrderNote()}</div>}
							   <div className="receipt__order-data">{this.getOrderData()}</div>
							   <div className="receipt__footer">{this.getReceiptFooter()}</div>
						   </div>,
						   document.body
					   )
					   : <Fragment/>;
	}
}

export default OrderReceiptPrint;
