/** global yithPosSettings */
import _                from 'lodash';
import { addQueryArgs } from "@wordpress/url";
import apiFetch         from '@wordpress/api-fetch';
import { applyFilters } from '@wordpress/hooks';

export function getProductImagePlaceholder() {
	return yithPosSettings.wc.placeholderImageSrc;
}

export function getProductImage( product ) {
	if ( product.yith_pos_image ) {
		return product.yith_pos_image;
	} else if ( product.image ) {
		return product.image;
	} else if ( product.images && product.images.length ) {
		return product.images[ 0 ];
	}
	return {};
}

export function getProductImageUrl( product ) {
	const image = getProductImage( product );

	return image.src || getProductImagePlaceholder();
}

export function getProductImageAlt( product ) {
	const image = getProductImage( product );

	return image.alt || '';
}

export function getMeta( product, key, single = true ) {
	const meta = product.meta_data.filter( m => m.key === key );
	let value  = '';
	if ( !_.isEmpty( meta ) ) {
		value = single ? meta[ 0 ].value : meta;
	}

	return applyFilters( 'yith_pos_product_get_meta', value, product, key, single );
}

export function getMaxQuantity( item, cartItems = [] ) {
	const { product } = item;
	let max           = 0;


	if ( product.sold_individually ) {
		max = 1;
	} else if ( product.manage_stock && !product.backorders_allowed ) {
		max = product.stock_quantity;
		if ( product.manage_stock === 'parent' && cartItems.length > 0 ) {
			const parent_id = product.parent_id;
			const co        = cartItems.filter( ci => ci.cartItemKey != item.cartItemKey && ci.product.parent_id == parent_id && ci.product.manage_stock === 'parent' );
			co.forEach( ci => max -= ci.qty );
		}
	}

	return max;
}
