/** global yithPosSettings */
import React, { Component, useState } from 'react';
import { __, _x, sprintf }  from '@wordpress/i18n';
import { dateI18n }         from '@wordpress/date';
import apiFetch             from '@wordpress/api-fetch';
import { addQueryArgs }     from '@wordpress/url';

import { formatCurrency }                                                                                                               from '../../packages/numbers';
import OrderDetailsLineItemProduct                                                                                                      from './order-details-line-item-product';
import OrderDetailsLineItem                                                                                                             from './order-details-line-item';
import { getObjectMetaData }                                                                                                            from '../../packages/objects';
import { getPaymentMethodTitle }                                                                                                        from '../../packages/gateways';
import { getCustomerFullName }                                                                                                          from '../../packages/customers';
import { getOrderFormattedDateTime, getOrderPaymentDetails, getOrderStatusName }                                                        from '../../packages/orders';
import { getOrderCouponDiscountPriceToDisplay, getOrderShippingLineTotalPriceToDisplay, showPriceIncludingTax, showTaxRow, taxEnabled } from '../../packages/taxes';
import { loggerStore }                                                                                                                  from '../logger';
import { applyFilters }                                                                                                                 from '@wordpress/hooks';
import { isPosDiscountCouponCode }                                                                                                      from '../../packages/data';
import OrderReceiptPrintControl                                                                                                         from './order-receipt-print-control';

const ORDER_DETAILS_AFTER_COUPONS_FILTER   = 'yith_pos_order_details_after_coupons';
const ORDER_DETAILS_SHOW_LINE_ITEMS_FILTER = 'yith_pos_order_details_show_line_items';

class OrderDetails extends Component {

	/* Added by WisdmLabs */
	// constructor( props ) {
	// 	super( props );
	// 	this.state = { totalPoints: '-' };
	// }
	/* Added by WisdmLabs */

	render() {
		const { order }                                                                                                                                                            = this.props;
		const { id, number, line_items, shipping_lines, fee_lines, coupon_lines, total, total_tax, payment_method, date_created_gmt, status, billing, customer_id, customer_note } = order;

		loggerStore.addLog( 'selected-order', 'Selected Order', order );

		let paymentMethodsDetails = getPaymentMethodTitle( payment_method );
		const multiplePayments    = getObjectMetaData( order, '_yith_pos_multiple_payment_methods' );
		if ( multiplePayments ) {
			const paymentNames    = multiplePayments.map( p => getPaymentMethodTitle( p.paymentMethod ) );
			paymentMethodsDetails = paymentNames.join( ', ' );
		}

		let customer = getCustomerFullName( billing );
		if ( !customer.length ) {
			customer = !!customer_id ? `#${customer_id}` : __( 'Guest', 'yith-point-of-sale-for-woocommerce' );
		}

		/* Added by WisdmLabs */
		// apiFetch( { path: addQueryArgs( 'wdm_yith_customisation/v1/points', { user_id: customer_id } ) } )
		// 	.then( points => this.setState( { totalPoints: points } ) )
		// 	.catch( error => alert( error.message ) );
		/* Added by WisdmLabs */

		const paymentDetails       = getOrderPaymentDetails( order );
		const formattedDateCreated = getOrderFormattedDateTime( order );

		const showLineItems = applyFilters( ORDER_DETAILS_SHOW_LINE_ITEMS_FILTER, coupon_lines.length || shipping_lines.length || fee_lines.length || showTaxRow(), { order } );

		return (
			<div className="yith-pos-order-details" data-order-id={id}>
				<div className="yith-pos-order-details__details">

					<div className="yith-pos-order-details__header">
						<div className="yith-pos-order-details__header__order-number" style={{ display: 'flex', alignItems: 'center' }}>
							{sprintf( __( 'Order #%s', 'yith-point-of-sale-for-woocommerce' ), number )}
						</div>
						<div className="yith-pos-order-details__header__details">
							<div className="yith-pos-order-details__header__details__row">
                            	<span
									className="order-paid-details">{sprintf( __( 'Paid via %s on %s', 'yith-point-of-sale-for-woocommerce' ),
																		 paymentMethodsDetails,
																		 formattedDateCreated )}</span>
								<span
									className={`order-status order-status--${status}`}>{getOrderStatusName( status )}</span>
							</div>
							<div className="yith-pos-order-details__header__details__row">
								{__( 'Customer:', 'yith-point-of-sale-for-woocommerce' )} <strong>{customer}</strong>
							</div>
							{/* Added by WisdmLabs */}
							<div className="yith-pos-order-details__header__details__row">
								{__( 'Total Points:', 'yith-point-of-sale-for-woocommerce' )} <strong>{order.customer_points ?? '-'}</strong>
							</div>
							{/* Added by WisdmLabs */}
						</div>
					</div>

					<div className="yith-pos-order-details__line-item-products">
						{line_items.map( ( item ) => {
							return (
								<OrderDetailsLineItemProduct key={`order-item-` + item.id} item={item}/>
							);
						} )}
					</div>

					{showLineItems &&
					 <div className="yith-pos-order-details__line-items">
						 {coupon_lines.map( ( item ) => {
							 let label = [__( 'COUPON', 'yith-point-of-sale-for-woocommerce' ), item.code].join( ' - ' );

							 if ( isPosDiscountCouponCode( item.code ) ) {
								 label = [
									 __( 'Discount', 'yith-point-of-sale-for-woocommerce' ),
									 getObjectMetaData( item, 'coupon_data' )?.description
								 ].filter( _ => _ ).join( ' - ' )
							 }

							 return (
								 <OrderDetailsLineItem key={`coupon-item-` + item.id} id={item.id}
									 type="coupon"
									 name={label}
									 total={formatCurrency( getOrderCouponDiscountPriceToDisplay( item ) )}/>
							 );
						 } )}

						 {applyFilters( ORDER_DETAILS_AFTER_COUPONS_FILTER, false, { order } )}

						 {shipping_lines.map( ( item ) => {
							 return (
								 <OrderDetailsLineItem key={`shipping-item-` + item.id} id={item.id}
									 type="shipping"
									 name={item.method_title}
									 total={formatCurrency( getOrderShippingLineTotalPriceToDisplay( item ) )}/>
							 );
						 } )}

						 {showTaxRow() &&
						  <div
							  className="yith-pos-order-details__item-row yith-pos-order-details__total yith-pos-order-details__total--total-tax">
							  <div className="name">{__( 'Tax', 'yith-point-of-sale-for-woocommerce' )}</div>
							  <div className="item_cost">{formatCurrency( total_tax )}</div>
						  </div>
						 }

						 {fee_lines.map( ( item ) => {
							 const type = item.total > 0 ? 'fee' : 'discount';
							 return (
								 <OrderDetailsLineItem key={`fee-item-` + item.id} id={item.number}
									 type={type}
									 name={item.name}
									 total={formatCurrency( item.total )}/>
							 );
						 } )}
					 </div>
					}

					<div className="yith-pos-order-details__item-row yith-pos-order-details__total yith-pos-order-details__total--total">
						<div className="name">{__( 'Total', 'yith-point-of-sale-for-woocommerce' )}</div>
						<div className="item_cost">{formatCurrency( total )}</div>
					</div>

					{paymentDetails && paymentDetails.map( ( detail ) => {
						return (
							<div
								key={detail.key}
								className={`yith-pos-order-details__item-row yith-pos-order-details__payment-detail yith-pos-order-details__payment-detail--${detail.type}`}
							>
								<div className="name">{detail.name}</div>
								<div className="item_cost">{formatCurrency( detail.amount )}</div>
							</div>
						)
					} )}

					{customer_note && (
						<div className="yith-pos-order-details__note">
							<i className="yith-pos-icon-item-note"/>
							<div className="note-content">
								<h5 className="note-title">{__( 'Note', 'yith-point-of-sale-for-woocommerce' )}</h5>
								<div className="note-text">{customer_note}</div>
							</div>
						</div> )}

				</div>
				<div className="yith-pos-order-details__actions">
					<OrderReceiptPrintControl order={order} />
				</div>

			</div>
		);
	}

}

export default OrderDetails;
