/* global yithPosSettings */
import { __, _n, _x, _nx } from '@wordpress/i18n';
import { getStoreList }    from '../../packages/data';

import { applyFilters } from '@wordpress/hooks';

const DASHBOARD_ORDER_CHARTS_FILTER = 'yith_pos_dashboard_order_charts';

export const filters = [
	{
		label       : __( 'Filter by Store', 'yith-point-of-sale-for-woocommerce' ),
		staticParams: ['register', 'chartType', 'page'],
		param       : 'store',
		showFilters : () => true,
		filters     : [
			{
				label: __( 'All Stores', 'yith-point-of-sale-for-woocommerce' ),
				value: 'all'
			},
			...getStoreList().map( ( { id, name } ) => {
				return { label: name, value: String( id ) };
			} )
		]
	},
	{
		label       : __( 'Filter by Register', 'yith-point-of-sale-for-woocommerce' ),
		staticParams: ['store', 'chartType', 'page'],
		param       : 'register',
		showFilters : ( query ) => query.store && query.store !== 'all',
		filters     : [
			{
				label: __(
					'All Registers',
					'yith-point-of-sale-for-woocommerce'
				),
				value: 'all'
			}
		]
	}
];

export const charts = applyFilters( DASHBOARD_ORDER_CHARTS_FILTER, [
	{
		key  : 'orders_count',
		label: __( 'Orders', 'yith-point-of-sale-for-woocommerce' ),
		type : 'number'
	},
	{
		key  : 'total_sales',
		label: __( 'Total Sales', 'yith-point-of-sale-for-woocommerce' ),
		type : 'currency'
	},
	{
		key  : 'net_revenue',
		label: __( 'Net Sales', 'yith-point-of-sale-for-woocommerce' ),
		type : 'currency'
	},
	{
		key  : 'avg_order_value',
		label: __( 'Average Order Value', 'yith-point-of-sale-for-woocommerce' ),
		type : 'currency'
	},
	{
		key  : 'avg_items_per_order',
		label: __( 'Average Items Per Order', 'yith-point-of-sale-for-woocommerce' ),
		type : 'number'
	},
	{
		key  : 'num_items_sold',
		label: __( 'Items', 'yith-point-of-sale-for-woocommerce' ),
		type : 'number'
	},
	{
		key  : 'total_customers',
		label: __( 'Customers', 'yith-point-of-sale-for-woocommerce' ),
		type : 'number'
	},
	{
		key  : 'coupons',
		label: __( 'Coupons', 'yith-point-of-sale-for-woocommerce' ),
		type : 'currency'
	}
] );
