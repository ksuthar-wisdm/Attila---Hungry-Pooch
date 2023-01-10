import React, { useEffect, useMemo, useRef } from 'react';
import { applyFilters }                      from '@wordpress/hooks';

import Product            from './product.jsx';
import ProductPlaceholder from './product-placeholder';
import ProductAdd         from './product-add';
import { useProducts }    from '../../store/products/productsSlice';

const PRODUCT_LIST_QUERY_ARGS_FILTER = 'yith_pos_product_list_query_args';

function ProductList( props ) {
	const { filter, category, addProductHandler, addCartItem }                                    = props;
	const listContainerRef                                                                        = useRef();
	const { products, isLoading, isFirstLoading, page, totalPages, fetchNextPage, fetchProducts } = useProducts();

	const query = useMemo( () => {
		let query = {};
		if ( 'on-sale' === filter ) {
			query.yith_on_sale = true;
		} else if ( 'featured' === filter ) {
			query.featured = true;
		}

		if ( category ) {
			query.category = category;
		}

		return applyFilters( PRODUCT_LIST_QUERY_ARGS_FILTER, query, props );
	}, [filter, category] );

	const maybeLoadNextPage = () => {
		if ( !isLoading && page < totalPages ) {
			fetchNextPage( query );
		}
	}

	const handleScroll = ( e ) => {
		const { scrollHeight, clientHeight, scrollTop } = e.target;

		if ( ( ( scrollHeight - scrollTop ) / 1.5 < clientHeight ) || scrollHeight <= clientHeight ) {
			maybeLoadNextPage();
		}
	};

	useEffect( () => {
		fetchProducts( query );
	}, [query] );

	// First load for high-size screens
	useEffect( () => {
		if ( listContainerRef.current ) {
			const { scrollHeight, clientHeight } = listContainerRef.current;

			if ( scrollHeight <= clientHeight ) {
				maybeLoadNextPage();
			}
		}
	}, [listContainerRef, isLoading] );

	const placeholders = [...Array( 6 ).keys()].map( ( placeholder, index ) => <ProductPlaceholder key={index}/> );

	return (
		<div className="yith-pos-product-list__list" onScroll={handleScroll}
			ref={listContainerRef}>
			{
				isFirstLoading ?
				placeholders :
				<>
					<ProductAdd key="add-product" onClick={addProductHandler}/>
					{products.map( ( product ) => {
						return (
							<Product key={product.id} product={product} addCartItem={() => {
								addCartItem( product );
							}}/>
						)
					} )}
					{!!isLoading && placeholders}
				</>
			}
		</div>
	);
}

export default ProductList;
