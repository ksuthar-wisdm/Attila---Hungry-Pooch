import React, { Component, Fragment } from 'react';
import { __ }                         from '@wordpress/i18n';

import ProductListFilters   from './products/product-list-filters';
import ProductList          from './products/product-list';
import ProductSearchSection from './product-search-section';
import ProductCategoryList  from './products/product-category-list';
import Nav                  from "./common/nav";


import { applyFilters } from '@wordpress/hooks';
import Icon             from '../packages/components/icon';

const PRODUCTS_SECTION_TABS_FILTER = 'yith_pos_product_section_tabs';

class ProductsSection extends Component {

	constructor() {
		super( ...arguments );

		this.state = {
			filter  : 'all',
			category: 0
		};
	}

	setFilter = ( filter ) => {
		const { scannerActive, onAction } = this.props;
		scannerActive && onAction( 'scan-product' );
		this.setState( { filter, category: 0 } );
	};

	setCategory = ( category ) => {
		this.setState( { category } );
	};

	render() {
		const { category, filter }                     = this.state;
		const { addCartItem, onAction, scannerActive } = this.props;
		const isScannerEnabled                         = 'yes' === yithPosSettings.register?.scanner_enabled;

		const isCategoryLayout = yithPosSettings.register.how_to_show_in_dashboard === 'categories';

		let filters = applyFilters( PRODUCTS_SECTION_TABS_FILTER, [
			{ key: 'all', label: __( 'All', 'yith-point-of-sale-for-woocommerce' ) },
			{ key: 'on-sale', label: __( 'On sale', 'yith-point-of-sale-for-woocommerce' ) },
			{ key: 'featured', label: __( 'Featured', 'yith-point-of-sale-for-woocommerce' ) }
		] );

		filters = filters.map( _ => {
			_.onClick = () => this.setFilter( _.key );
			_.active  = _.key === filter && !( isScannerEnabled && scannerActive );
			return _;
		} );

		const navItems = [
			...filters,
			{ key: 'add-product', label: __( 'Add product', 'yith-point-of-sale-for-woocommerce' ), icon: 'add', onClick: () => onAction( 'add-product' ) }
		];

		if ( isScannerEnabled ) {
			navItems.push( { key: 'scan-product', label: __( 'Scan product', 'yith-point-of-sale-for-woocommerce' ), icon: 'barcode', onClick: () => onAction( 'scan-product' ), active: scannerActive } );
		}

		return (
			<div className="yith-pos-product-list">

				<ProductSearchSection onClickResult={addCartItem} scannerActive={scannerActive}/>
				<Nav items={navItems} className="yith-pos-product__actions"/>

				{scannerActive && <div className="yith-pos-scanner-tab">
					<div className="scanner-image"/>
				</div>}
				{
					!scannerActive && (
					isCategoryLayout && filter === 'all' ?
					<>
						{!category ?
						 <ProductCategoryList onSelect={this.setCategory} addProductHandler={() => onAction( 'add-product' )}/> :
						 <div className="yith-pos-product-list__category">
							 <div className="yith-pos-product-list__go-back-wrapper">
								 <div className="yith-pos-product-list__go-back" onClick={() => {
									 this.setCategory( 0 );
								 }}><Icon icon="arrow-left"/>
								 </div>
							 </div>
							 <ProductList addCartItem={addCartItem} category={category} addProductHandler={() => onAction( 'add-product' )}/>
						 </div>
						}
					</> :
					<ProductList addCartItem={addCartItem} filter={filter} addProductHandler={() => onAction( 'add-product' )}/>
					)
				}

			</div>
		);
	}

}

export default ProductsSection;
