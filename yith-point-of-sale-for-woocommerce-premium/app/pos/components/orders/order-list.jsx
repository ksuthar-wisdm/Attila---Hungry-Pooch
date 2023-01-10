/** global yithPosSettings */
import React, { Component, Fragment } from 'react';
import OrderListItem                  from "./order-list-item";
import { i18n_order_label as labels } from "./config";

import { format }                    from '@wordpress/date';
import Icon                          from '../../packages/components/icon';
import OrderListGroupSkeleton        from './order-list-group-skeleton';
import BlankState                    from '../../packages/components/blank-state';
import { __ }                        from '@wordpress/i18n';
import { formatDate, getDateFormat } from '../../packages/date';

class OrderList extends Component {

	constructor() {
		super( ...arguments );
	}

	render() {
		const { loading, orders, onChangeDate, currentOrder, onSelectOrder, onViewStats } = this.props;

		const className = 'yith-pos__order-list';

		if ( !loading && !orders.length ) {
			return <BlankState className={className} icon="bank-check" message={__( 'You have no orders yet!', 'yith-point-of-sale-for-woocommerce' )}/>;
		}

		return <div className={className}>
			{orders.length > 0 && orders.map( ( group ) => {
				const className          = "order-group" + ( ( group.opened ) ? ' opened' : '' );
				const items_number       = group.items.length;
				const items_number_label = ( items_number > 1 || items_number === 0 ) ? labels.ordersLabel : labels.orderLabel;
				return (
					<div className={className} key={new Date( group.date )}>
						<div className="order-group-data" onClick={() => onChangeDate( group )}>
							<Icon icon="expand-less" className="arrow"/>
							<div
								className="date">{group.date}</div>
							<div className="stat">{items_number} {items_number_label} <i
								className="yith-pos-icon-chart" onClick={e => {
								e.stopPropagation();
								onViewStats( group );
							}}/></div>
						</div>
						<div className="order-group-items">
							{group.items.map( ( order ) => <OrderListItem key={order.id} order={order}
								onSelectOrder={onSelectOrder}
								currentOrder={currentOrder}/> )}
						</div>
					</div>
				)
			} )}
			{
				!!loading && [...Array( !!orders.length ? 3 : 8 ).keys()].map( _ => <OrderListGroupSkeleton key={_}/> )
			}
		</div>;
	}
}

export default OrderList;