import React, { Component } from 'react';
import { addQueryArgs }     from '@wordpress/url';
import apiFetch             from '@wordpress/api-fetch';
import { applyFilters }     from '@wordpress/hooks';

import Product            from './product';
import ProductPlaceholder from './product-placeholder';

const PRODUCT_VARIATIONS_QUERY_ARGS = `yith_pos_product_variations_query_args`;

class ProductVariationSelector extends Component {
	constructor() {
		super( ...arguments );
		this.productsPerPage = 10;
		this.variableId      = this.props.variableId;
		this.variableProduct = this.props.variableProduct;
		this.path            = `wc/v3/products/${this.variableId}/variations`;

		this._query = {
			per_page        : this.productsPerPage,
			status          : 'publish',
			orderby         : 'menu_order',
			order           : 'asc',
			yith_pos_request: 'get-product-variations',
			yith_pos_store  : yithPosSettings.store.id,
			lang            : yithPosSettings.language
		};

		this.state = {
			products       : [],
			loading        : true,
			loadingNextPage: false,
			allLoaded      : false,
			page           : 1
		};

		this.listElement = React.createRef();
	}

	componentDidMount() {
		this.loadProducts();
	}

	getQuery = () => {
		const query = Object.assign( {}, this._query );
		return applyFilters( PRODUCT_VARIATIONS_QUERY_ARGS, query )
	};

	loadProducts = () => {
		this.setState( { loading: true, page: 1, allLoaded: false } );
		apiFetch( { path: addQueryArgs( this.path, this.getQuery() ) } )
			.then( loadedProducts => {
				if ( loadedProducts ) {
					const newProducts = loadedProducts
						.filter( product => product.purchasable )
						.map( product => {
							product.parent_id = this.variableId;
							return product;
						} );

					this.setState( { products: newProducts, loading: false } );
				}

				if ( loadedProducts.length < this.productsPerPage ) {
					this.setState( { allLoaded: true } );
				} else {
					this.handleScroll();
				}
			} );
	};

	loadNextPage = () => {
		const { page, loadingNextPage, allLoaded } = this.state;
		if ( !loadingNextPage && !allLoaded ) {
			this.setState( { loadingNextPage: true } );
			const nextPage = page + 1;

			const query = this.getQuery();
			query.page  = nextPage;

			apiFetch( { path: addQueryArgs( this.path, query ) } )
				.then( loadedProducts => {
					if ( loadedProducts ) {
						const newProducts = loadedProducts
							.filter( product => product.purchasable )
							.map( product => {
								product.parent_id = this.variableId;
								return product;
							} );

						this.setState( ( { products } ) => {
							return {
								products       : [...products, ...newProducts],
								loadingNextPage: false,
								page           : nextPage
							}
						} );
					}

					if ( loadedProducts.length < this.productsPerPage ) {
						this.setState( { allLoaded: true, loadingNextPage: false } );
					}
				} );
		}
	};

	handleScroll = () => {
		const { scrollHeight, clientHeight, scrollTop } = this.listElement.current;

		if ( ( ( scrollHeight - scrollTop ) / 1.5 < clientHeight ) || scrollHeight <= clientHeight ) {
			this.loadNextPage();
		}
	};

	render() {
		const { products, loading, loadingNextPage, allLoaded } = this.state;
		const { addCartItem }                                   = this.props;

		const placeholders = [...Array( 3 ).keys()].map( ( placeholder, index ) => {
			return <ProductPlaceholder key={index}/>
		} );

		return (
			<div className="yith-pos-product-variation-selector">
				<div className="yith-pos-product-variation-selector__list" onScroll={this.handleScroll}
					ref={this.listElement}>
					{
						loading ?
						placeholders :
						[
							products.map( ( product ) => {
								const reducer = ( accumulator, attr ) => accumulator.concat( attr.option );
								product.name  = product.attributes.reduce( reducer, [] ).join( ' - ' );
								return (
									<Product key={product.id} product={product} addCartItem={() => {
										product.name = this.variableProduct.name;
										addCartItem( product );
									}}/>
								)
							} ),
							loadingNextPage && !allLoaded && placeholders
						]
					}
				</div>
			</div>
		);
	}
}

export default ProductVariationSelector;
