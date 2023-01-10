/** global yithPosSettings */
import React, { Component } from 'react';

import { i18n_order_label as labels }                from "./config";
import { getCustomerFullName }                       from "../../packages/customers";
import { formatCurrency }                            from "../../packages/numbers";
import { getOrderFormattedTime, getOrderStatusName } from '../../packages/orders';
import Icon                                          from '../../packages/components/icon';

class OrderListItem extends Component {
	render() {
		const { order, currentOrder, onSelectOrder } = this.props;
		const selected                               = currentOrder.id === order.id;
		const className                              = "yith-pos__order-list-item" + ( selected ? ' selected' : '' );
		const orderTitle                             = labels.orderTitle + order.number;
		const customer                               = order.customer_id === 0 ? labels.guest : getCustomerFullName( order.billing );
		const items_number                           = order.line_items.length;
		const items_number_label                     = ( items_number > 1 || items_number === 0 ) ? labels.itemsLabel : labels.itemLabel;

		return (
			<div className={className} onClick={() => onSelectOrder( order )}>
				<Icon className="arrow-icon" icon="arrow-right"/>
				<div className="order-info">
					<span className="order-title">{orderTitle}</span>
					<span className="order-time-status">
                        <span className="order-time">{getOrderFormattedTime( order )} </span>
                        <span className={`order-status ${order.status}`}>{getOrderStatusName( order.status )}</span>
                    </span>
					<span className="order-customer">{labels.customer} <strong>{customer}</strong> </span>
				</div>
				<div className="order-numbers">
					<span className="order-amount">{formatCurrency( order.total, order.currency_symbol )} </span>
					<span className="order-items">{items_number + ' ' + items_number_label} </span>
				</div>
			</div>
		);
	}
}

export default OrderListItem;