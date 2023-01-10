import React            from "react";
import { applyFilters } from '@wordpress/hooks';

import { getProductImageUrl, getProductImageAlt } from '../../packages/products'
import { i18n_product_label as labels }           from './config';

import { getProductPriceHTMLToDisplayInShop } from '../../packages/taxes';
import ProductStockBadge                      from './product-stock-badge';

const SHOW_PRODUCT_BADGE_FILTER   = 'yith_pos_show_stock_badge_in_search_results';
const SEARCH_RESULTS_PRODUCT_NAME = 'yith_pos_search_results_product_name';
const ENABLE_MODAL_ON_CLICK_PRODUCT_NAME_SEARCHBAR = 'yith_pos_enable_modal_on_click_product_name_searchbar';

const ProductSearchResult = ( { product, onClick } ) => {

	const imageUrl       = getProductImageUrl( product );
	const imageAlt       = getProductImageAlt( product );
	const outOfStock     = product.stock_status === 'outofstock';
	const showStockBadge = applyFilters( SHOW_PRODUCT_BADGE_FILTER, false, product );
	const enableModal	 = applyFilters( ENABLE_MODAL_ON_CLICK_PRODUCT_NAME_SEARCHBAR, ! outOfStock );

	let classes = ['search-result'];
	outOfStock && classes.push( 'outofstock' );
	classes.push( `product-type-${product.type}` );

	return (
		<div className={classes.join( ' ' )} onClick={() => {
			enableModal && onClick();
		}}>
			{showStockBadge && <ProductStockBadge product={product}/>}
			<span className="product-title">{applyFilters( SEARCH_RESULTS_PRODUCT_NAME, product.name, product )}
				{!outOfStock && <span>{labels.addToCart}</span>}
            </span>
			<span className="product-price" dangerouslySetInnerHTML={{ __html: getProductPriceHTMLToDisplayInShop( product ) }}/>
			<img src={imageUrl} alt={imageAlt} className="product-image"/>
		</div>
	)
};

export default ProductSearchResult;
