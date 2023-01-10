import classNames      from 'classnames';
import { __, sprintf } from '@wordpress/i18n';

import { isMultiStockEnabled, shouldShowStockOnPos } from '../../packages/settings';

export default function ProductStockBadge( { product } ) {
	const { stock_status, stock_quantity, type, manage_stock } = product;

	if ( !shouldShowStockOnPos() ) {
		return null;
	}

	if ( 'instock' === stock_status && !stock_quantity ) {
		return null;
	}

	// Hide badge stock for variable products when the stock-status depends by its variations and the multi-stock is enabled.
	if ( 'variable' === type && false === manage_stock && isMultiStockEnabled() ) {
		return null;
	}

	const statusClasses = {
		outofstock : 'out-of-stock',
		instock    : 'in-stock',
		onbackorder: 'on-backorder'
	};

	const statusLabels = {
		outofstock: __( 'out of stock', 'yith-point-of-sale-for-woocommerce' ),
		// translators: %s is the stock quantity.
		instock    : sprintf( __( '%s in stock', 'yith-point-of-sale-for-woocommerce' ), stock_quantity ),
		onbackorder: __( 'on backorder', 'yith-point-of-sale-for-woocommerce' )
	};

	const statusClass = statusClasses[ stock_status ] ?? stock_status;
	const label       = statusLabels[ stock_status ] ?? stock_quantity;

	const classes = classNames( 'stock-badge', statusClass );

	return <div className={classes}>{label}</div>
}