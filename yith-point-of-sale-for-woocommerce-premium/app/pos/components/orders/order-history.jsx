import React, { Component, Fragment } from 'react';
import _                              from 'lodash';
import apiFetch                       from '@wordpress/api-fetch';
import { __ }                         from '@wordpress/i18n';
import { addQueryArgs }               from "@wordpress/url";
import { Link }                       from 'react-router-dom';
import { applyFilters }               from '@wordpress/hooks';

import OrderList                      from "./order-list";
import OrderDetails                   from "./order-details";
import Select                         from "react-select";
import { i18n_order_label as labels } from "./config";
import { selectStyle }                from "../common/form";
import OrderDetailsSkeleton           from './order-details-skeleton';
import { formatDate, getDateFormat }  from '../../packages/date';

const SHOW_LOAD_MORE_BUTTON = applyFilters( 'yith_pos_order_history_show_load_more_button', false );

class OrderHistory extends Component {

	constructor() {
		super( ...arguments );

		this.queryArgs = {
			per_page        : 50,
			yith_pos_request: 'get-orders',
			yith_pos_context: 'order-history',
			store           : yithPosSettings.store.id
		};

		this.state = {
			currentOrder   : {},
			registers      : [],
			currentRegister: { label: labels.allRegisters, value: 0 },
			orders         : [],
			orderList      : [],
			loading        : true,
			loadingNextPage: false,
			allLoaded      : false,
			page           : 1
		};

		this.references = {
			listContainer: React.createRef()
		}
	}

	componentDidMount() {
		const { currentRegister } = this.state;
		this.getOrders( currentRegister );
		this.getRegisters();
	}

	componentDidUpdate( prevProps, prevState, snapshot ) {
		if ( prevState.currentRegister != this.state.currentRegister ) {
			this.getOrders( this.state.currentRegister );
		}
	}

	getRegisters = () => {
		const path = '/wp/v2/yith-pos-store/' + yithPosSettings.store.id;
		apiFetch( {
					  path: path
				  } ).then( ( store ) => {
			this.setState( { registers: store.registers } )
		} ).catch( ( error ) => {
			console.log( error )
		} );
	}

	getRegistersOptions = () => {
		const { registers } = this.state;
		let registerOptions = [{ label: labels.allRegisters, value: 0 }];
		if ( registers.length > 0 ) {
			registers.forEach( r => {
				registerOptions.push( { label: r.name, value: r.id } );
			} )
		}

		return registerOptions;
	}

	onChangeRegister = ( register ) => {
		this.setState( {
						   currentRegister: register,
						   currentOrder   : {},
						   orders         : [],
						   orderList      : [],
						   loading        : false,
						   loadingNextPage: false,
						   allLoaded      : false,
						   page           : 1
					   } );
	}

	getOrders = ( currentRegister ) => {
		this.setState( { loading: true } );
		let q = this.queryArgs;
		if ( currentRegister.value !== 0 ) {
			q[ 'register' ] = currentRegister.value;
		} else {
			delete q[ 'register' ];
		}
		q[ 'offset' ] = 0;
		const query   = Object.assign( {}, q );

		apiFetch( {
					  path: addQueryArgs( `wc/v3/orders`, query )
				  } ).then( ( orders ) => {
			const orderList  = orders;
			const allLoaded  = orders.length < q.per_page;
			let newOrders    = [];
			let orderGrouped = new Map();

			if ( orders.length > 0 ) {
				orders.forEach( ( order ) => {
					const theDate       = new Date( order.date_created_gmt + 'Z' );
					order.timestamp     = theDate.getTime();
					order.formattedDate = formatDate( getDateFormat(), theDate );
					newOrders.push( order );
				} );

				newOrders    = _.reverse( _.sortBy( newOrders, ['timestamp'] ) );
				orderGrouped = _.groupBy( newOrders, function ( n ) {
					return n.formattedDate;
				} );

				orderGrouped = Object.entries( orderGrouped ).map( ( [date, items] ) => ( { date, items, opened: false } ) );
			}

			if ( !_.isEmpty( orderGrouped ) && orderGrouped.length > 0 ) {
				orderGrouped[ 0 ][ 'opened' ] = true;
				this.setState( { currentOrder: orderGrouped[ 0 ].items[ 0 ] } );
			}

			this.setState( { orders: orderGrouped, loading: false, orderList, allLoaded } );
		} );
	};

	loadNextPage = () => {
		const { page, loadingNextPage, currentRegister, orders: oldOrders } = this.state;
		let { orderList }                                                   = this.state;
		if ( !loadingNextPage ) {
			this.setState( { loadingNextPage: true } );
			let q = this.queryArgs;
			if ( currentRegister.value !== 0 ) {
				q[ 'register' ] = currentRegister.value;
			} else {
				delete q[ 'register' ];
			}

			q.offset    = page * q.per_page;
			const query = Object.assign( {}, q );

			apiFetch( {
						  path: addQueryArgs( `wc/v3/orders`, query )
					  } ).then( ( orders ) => {
				if ( orders ) {
					const allLoaded  = orders.length < q.per_page;
					orderList        = [...orderList, ...orders];
					orders           = orderList;
					let newOrders    = [];
					let orderGrouped = new Map();

					if ( orders.length > 0 ) {
						orders.forEach( ( order ) => {
							const theDate       = new Date( order.date_created_gmt + 'Z' );
							order.timestamp     = theDate.getTime();
							order.formattedDate = formatDate( getDateFormat(), theDate );
							newOrders.push( order );
						} );

						newOrders    = _.reverse( _.sortBy( newOrders, ['timestamp'] ) );
						orderGrouped = _.groupBy( newOrders, function ( n ) {
							return n.formattedDate;
						} );

						orderGrouped = Object.entries( orderGrouped ).map( ( [date, items] ) => ( { date, items, opened: false } ) );

						orderGrouped.forEach( ( g, index ) => {
							const filtered = oldOrders.filter( o => ( o.date === g.date && o.opened ) );
							if ( typeof filtered !== 'undefined' && filtered.length > 0 ) {
								orderGrouped[ index ][ 'opened' ] = true;
							}
						} );


					}

					this.setState(
						{
							orders         : orderGrouped,
							loadingNextPage: false,
							orderList,
							page           : page + 1,
							allLoaded
						}
					);
				}
			} );
		}
	};

	showSelectedOrder = ( order ) => {
		this.setState( { currentOrder: order } );
	}

	onChangeDate = ( dateDay ) => {
		let { orders } = this.state;
		orders         = orders.map( group => {
			if ( group.date === dateDay.date ) {
				group.opened = !group.opened;
			}
			return group;
		} )

		this.setState( { orders } );
	};

	handleScroll = () => {
		const element       = this.references.listContainer.current;
		const { allLoaded } = this.state;
		if ( !allLoaded && ( ( ( element.scrollHeight - element.scrollTop ) / 2 < element.clientHeight ) || element.scrollHeight === element.clientHeight ) ) {
			this.loadNextPage();
		}
	};

	render() {
		const { orders, currentOrder, loading, currentRegister, loadingNextPage, allLoaded } = this.state;
		const { onViewGroupOrderStats }                                                      = this.props;

		return (
			<Fragment>
				<div className="yith-pos-order-history-wrapper">
					<Link to="/">{__( '< Back to register screen', 'yith-point-of-sale-for-woocommerce' )}</Link>
					<Select
						styles={selectStyle()}
						name="registers"
						value={currentRegister}
						options={this.getRegistersOptions()}
						onChange={this.onChangeRegister}
						theme={theme => ( {
							...theme,
							borderRadius: 0,
							colors      : {
								...theme.colors,
								primary25: '#f7f7f7',
								primary50: '#f7f7f7',
								primary75: '#f7f7f7',
								primary  : '#f7f7f7'
							}
						} )}
					/>
					<div onScroll={this.handleScroll}
						ref={this.references.listContainer}
						className="yith-pos__order-list__container"
					>
						<OrderList orders={orders} currentOrder={currentOrder}
							loading={loading || loadingNextPage} onSelectOrder={this.showSelectedOrder}
							onViewStats={onViewGroupOrderStats}
							onChangeDate={this.onChangeDate}
						/>
						{!!SHOW_LOAD_MORE_BUTTON && !allLoaded && !loading &&
						 <button className="button button--primary" onClick={this.loadNextPage}>{__( 'Load more', 'yith-point-of-sale-for-woocommerce' )}</button>}
					</div>

				</div>
				{
					!loading ?
					(
						!_.isEmpty( currentOrder ) ?
						<OrderDetails order={currentOrder}/> :
						<div className="yith-pos-order-details"/>
					) :
					<OrderDetailsSkeleton/>
				}
				{}
			</Fragment>

		)
	}

}

export default OrderHistory;