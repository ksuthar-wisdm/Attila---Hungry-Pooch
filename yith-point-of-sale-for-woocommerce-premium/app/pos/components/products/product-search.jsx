import React, { Component } from 'react';
import apiFetch             from '@wordpress/api-fetch';
import { addQueryArgs }     from "@wordpress/url";
import { applyFilters }     from '@wordpress/hooks';

import ProductSearchResult              from "./product-search-result";
import { i18n_product_label as labels } from './config';

const ALLOW_OUT_OF_STOCK_PRODUCTS_WHEN_SCANNING_FILTER = 'yith_pos_allow_out_of_stock_products_when_scanning';
const DISABLE_MOBILE_KEYBOARD_WHEN_SCANNING_FILTER     = 'yith_pos_disable_mobile_keyboard_when_scanning';

let controller;
let signal;

class ProductSearch extends Component {

	constructor() {
		super( ...arguments );

		this.minChar = 3;

		this.searchTimeOut = false;

		this.queryArgs = {
			per_page        : yithPosSettings.maxProductSearchResults ?? 10,
			status          : 'publish',
			yith_pos_request: 'search-products',
			yith_pos_store  : yithPosSettings.store.id,
			lang            : yithPosSettings.language
		};

		this.state = {
			valueChanged: false,
			validValue  : false,
			products    : [],
			showResult  : false,
			loading     : false,
			value       : ''
		};

		this.references = {
			search: React.createRef()
		}

	}

	componentDidMount() {
		const { scannerActive } = this.props;

		scannerActive && this.references.search.current.focus();
		document.addEventListener( 'click', this.handleEvent, true );
	}

	componentDidUpdate( prevPros ) {
		if ( this.props.scannerActive !== prevPros.scannerActive ) {
			this.props.scannerActive && this.references.search.current.focus();
		}
	}

	componentWillUnmount() {
		document.removeEventListener( 'click', this.handleEvent, true );
	}

	handleEvent = event => {
		const domNode = ReactDOM.findDOMNode( this );

		if ( event.keyCode === 27 || !domNode || !domNode.contains( event.target ) ) {
			this.resetResult();
		}
	};

	resetResult = () => {
		this.references.search.current.value = '';
		this.setState( {
						   products  : [],
						   showResult: false,
						   loading   : false,
						   value     : ''
					   } );
	};

	searchProducts = ( event ) => {
		const prevValue   = this.state.value;
		const queryString = event.currentTarget.value;
		let value         = queryString;

		if ( prevValue === queryString ) {
			return;
		}

		this.setState( { showResult: true, validValue: false, value } );

		if ( typeof controller !== 'undefined' ) {
			// Cancel the previous request
			controller.abort();
		}

		if ( queryString === '' || queryString.length < this.minChar ) {
			this.setState( { products: [], value, loading: false } );
			return;
		}

		if ( "AbortController" in window ) {
			controller = new AbortController();
			signal     = controller.signal;
		}

		if ( this.searchTimeOut ) {
			clearTimeout( this.searchTimeOut );
		}

		this.setState( { loading: true, validValue: true, value } );

		this.searchTimeOut = setTimeout( () => {
			this.queryArgs         = { ...this.queryArgs, yith_pos_scan: this.props.scannerActive ? 'yes' : 'no' };
			let query, filterAfter = false;
			if ( yithPosSettings.barcodeMeta === '_sku' && this.props.scannerActive ) {
				query       = { ...this.queryArgs, ...yithPosSettings.register.query_options, category: '', exclude_category: '', sku: queryString, yith_pos_scan: 'sku' };
				filterAfter = { ...yithPosSettings.register.query_options };
			} else if ( this.props.scannerActive ) {
				query       = { ...this.queryArgs, ...yithPosSettings.register.query_options, category: '', exclude_category: '', search: queryString };
				filterAfter = { ...yithPosSettings.register.query_options };
			} else {
				query = { ...this.queryArgs, ...yithPosSettings.register.query_options, search: queryString };
			}

			apiFetch( {
						  path  : addQueryArgs( `wc/v3/products`, query ),
						  signal: signal
					  } ).then( ( products ) => {
				products = products.filter( ( product ) => product.purchasable );

				if ( filterAfter ) {
					const filterCat = ( categories, product, include ) => {
						let hasCat       = false,
							hasParentCat = false;

						categories = categories.split( ',' );
						categories = categories.map( id => parseInt( id ) );

						if ( product.categories ) {
							hasCat = !!product.categories.filter( ( _category ) => categories.includes( _category.id ) ).length;
						}

						if ( product.parent_categories ) {
							hasParentCat = !!product.parent_categories.filter( ( _category ) => categories.includes( _category.id ) ).length;
						}

						return include ? ( hasCat || hasParentCat ) : ( !hasCat && !hasParentCat );
					}

					if ( filterAfter.category ) {
						products = products.filter( ( product ) => filterCat( filterAfter.category, product, true ) );
					}

					if ( filterAfter.exclude_category ) {
						products = products.filter( ( product ) => filterCat( filterAfter.exclude_category, product, false ) );
					}
				}

				let allowDirectAddToCart = products.length === 1 && this.props.scannerActive;

				if ( allowDirectAddToCart && !applyFilters( ALLOW_OUT_OF_STOCK_PRODUCTS_WHEN_SCANNING_FILTER, true ) ) {
					allowDirectAddToCart = products[ 0 ].stock_status !== 'outofstock';
				}

				if ( allowDirectAddToCart ) {
					this.props.onClickResult( products[ 0 ] );
					this.resetResult();
				} else {
					this.setState( { products: products, loading: false, value, showResult: true } );
				}
			} ).catch( ( error ) => {
				console.log( error );
			} );
		}, 400 );
	};

	render() {

		const { products, showResult, loading, validValue, value } = this.state;
		const { onClickResult, scannerActive }                     = this.props;
		const noResultText                                         = !validValue ? labels.insertChar : labels.noResult;
		let search_result_class                                    = 'search-product-results';
		const isMobileKeyboardDisabled                             = scannerActive && applyFilters( DISABLE_MOBILE_KEYBOARD_WHEN_SCANNING_FILTER, false );

		if ( loading ) {
			search_result_class += ' is-loading';
		}

		return (
			<div className="search-wrapper">
				<input
					ref={this.references.search}
					className="product-search"
					name="product-search"
					type="text"
					onKeyUp={this.searchProducts}
					onKeyDown={this.handleEvent}
					onChange={this.searchProducts}
					autoComplete="off"
					inputMode={isMobileKeyboardDisabled ? 'none' : 'text'}
				/>
				{showResult && <div className={search_result_class}>
					{products.length > 0 &&
					 products.map( ( product ) => (
						 <ProductSearchResult product={product} key={product.id}
							 onClick={() => {
								 onClickResult( product );
							 }}/>
					 ) )
					}
					{products.length === 0 && <div className="no-results">{noResultText}</div>}
				</div>}
			</div>
		)
	};
}

export default ProductSearch;