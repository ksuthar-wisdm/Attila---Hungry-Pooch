import React            from 'react';
import _                from 'lodash';
import { addQueryArgs } from '@wordpress/url';
import apiFetch         from '@wordpress/api-fetch';
import { __, sprintf }  from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';

import Form                                                                     from '../common/form';
import { parseStringPrice, priceValidation }                                    from '../../packages/numbers/index';
import { searchCategories }                                                     from '../../packages/categories/index';
import { i18n_product_label as labels, enabledSelectOptions, taxSelectOptions } from './config';

const NEW_PRODUCT_DEFAULT_DATA_FILTER = 'yith_pos_new_product_default_data';

class ProductAddNewForm extends Form {
	constructor() {
		super( ...arguments );

		this.typeTax         = yithPosSettings.priceIncludesTax ? 'inclusive' : 'exclusive';
		this.taxTaxesOptions = this.getTaxClassesOptions();

		this.state = {
			defaultCategories: [],
			data             : applyFilters(
				NEW_PRODUCT_DEFAULT_DATA_FILTER,
				{
					productName    : '',
					productCategory: '',
					sku            : '',
					taxStatus      : 'taxable',
					taxClass       : '',
					defaultPrice   : '',
					manageStock    : 'disabled',
					quantityInStock: '',
					syncWCProduct  : 'disabled',
					catalogVisibility: 'hidden'
				}
			),
			error            : {}
		};

		this.fieldsRequired = ['productName', 'defaultPrice'];
	}

	componentDidMount() {
		searchCategories().then( ( categories ) => this.setState( { defaultCategories: categories } ) );
	}

	getTaxClassesOptions = () => {
		const taxTaxesOptions            = [];
		const { classes, classesLabels } = yithPosSettings.tax;

		classes.map( ( singleClass, index ) => {
			if ( singleClass === '' ) {
				classesLabels[ index ] = labels.standard;
			}
			taxTaxesOptions.push( { key: singleClass, label: classesLabels[ [index] ] } );
		} );

		return taxTaxesOptions;
	};

	checkSKU = ( sku ) => {
		const query = {
			per_page: 10,
			sku     : sku,
			lang    : yithPosSettings.language
		};

		apiFetch( {
					  path: addQueryArgs( `wc/v3/products`, query )
				  } ).then( ( products ) => {
			const { error } = this.state;
			if ( products.length > 0 ) {
				error.sku = labels.invalidSKU;
				this.setState( { error } );
			} else {
				_.unset( error, 'sku' );
			}

			this.setState( { error } );
		} );
	};

	addProduct = ( product ) => {
		const query = {
			yith_pos_request: 'create-product',
			yith_pos_store  : yithPosSettings.store.id,
			lang            : yithPosSettings.language
		};

		apiFetch( {
					  path  : addQueryArgs( '/wc/v3/products', query ),
					  data  : Object.assign( {}, product ),
					  method: 'POST'
				  } )
			.then( ( product ) => {
				this.props.addCartItemProduct( product, 1 );
				this.props.close();
			} )
			.catch( ( error ) => {
				console.log( error );
			} );
	};

	handleSubmitProductCategory = ( selected ) => {
		const { data }       = this.state;
		data.productCategory = selected.value;
		this.setState( { data } );
	};

	noOptionsSelectMessage = () => {
		return labels.noOptionsMessage;
	};

	handleFieldChange = ( { currentTarget: input } ) => {
		const { data }     = this.state;
		data[ input.name ] = input.value;

		if ( input.name === 'sku' ) {
			this.checkSKU( input.value );
		}

		if ( this.fieldsRequired.indexOf( input.name ) >= 0 ) {
			this.validateField( input.name );
		}

		this.setState( { data } );
	};

	validateField = ( field ) => {
		const { data, error } = this.state;

		if ( data[ field ] === '' ) {
			error[ field ] = labels.required;
		} else {
			delete error[ field ];
		}

		if ( field === 'defaultPrice' ) {
			let errorMessage = priceValidation( data[ field ] );

			if ( !_.isEmpty( errorMessage ) ) {
				if ( errorMessage === 'format-price' ) {
					errorMessage = sprintf(
						__(
							'Please enter a number. If decimal, use the decimal separator (%s). Never use thousand separators.',
							'yith-point-of-sale-for-woocommerce'
						),
						yithPosSettings.wc.currency.decimal_separator
					);
				} else if ( errorMessage === 'negative-price' ) {
					errorMessage = sprintf(
						__(
							'Please enter a positive number. If decimal, use the decimal separator (%s). Never use thousand separators.',
							'yith-point-of-sale-for-woocommerce'
						),
						yithPosSettings.wc.currency.decimal_separator
					);
				}

				error[ field ] = errorMessage;
			}
		}

		this.setState( { error } );
	};

	doSubmit = () => {
		const { data, error } = this.state;

		this.fieldsRequired.map( ( field ) => this.validateField( field ) );
		if ( !_.isEmpty( error ) ) {
			return;
		}

		let categories = [];
		if ( data.productCategory !== '' ) {
			categories.push( { id: data.productCategory } );
		}

		if ( data.syncWCProduct === 'enabled' ) {
			const product = {
				name              : data.productName,
				type              : 'simple',
				regular_price     : parseStringPrice( data.defaultPrice ),
				categories        : categories,
				sku               : data.sku,
				manage_stock      : data.manageStock === 'enabled',
				stock_quantity    : data.quantityInStock === '' ? null : data.quantityInStock,
				tax_status        : data.taxStatus,
				tax_class         : data.taxClass,
				catalog_visibility: data.catalogVisibility
			};

			this.addProduct( product );
		} else {
			const { addCartItemProduct, close } = this.props;
			const product                       = {
				id                : 'custom' + new Date().valueOf(),
				name              : data.productName,
				type              : 'simple',
				price             : data.defaultPrice,
				categories        : categories,
				sku               : data.sku,
				manage_stock      : data.manageStock === 'enabled',
				stock_quantity    : data.quantityInStock === '' ? null : data.quantityInStock,
				tax_status        : data.taxStatus,
				tax_class         : data.taxClass,
				isPosCustomProduct: true
			};

			addCartItemProduct( product, 1 );
			close();
		}
	};

	render() {
		const { data, error, defaultCategories } = this.state;

		const manageStockEnabled    = 'enabled' === data.manageStock;
		const formClassName         = 'yith-pos-new-product__form' + ( _.isEmpty( error ) ? '' : ' yith-pos-new-product__with_errors' );
		const canCreateRealProducts = 'yith_pos_create_products' in yithPosSettings.user.posCaps;
		const isCreatingRealProduct = 'enabled' === data.syncWCProduct;

		return (
			<form onSubmit={this.handleSubmit} onClick={( e ) => e.preventDefault()} className={formClassName}>
				{canCreateRealProducts && this.renderSelect( 'syncWCProduct', labels.syncWCProduct, enabledSelectOptions )}
				{this.renderInput( 'productName', labels.productName, '', 'text', false, true )}
				{this.renderInput( 'defaultPrice', labels.defaultPrice, '', 'text', false, true )}

				{this.renderSelect( 'taxStatus', labels.taxStatus, taxSelectOptions )}
				{this.renderSelect( 'taxClass', labels.taxClass, this.taxTaxesOptions )}

				{
					canCreateRealProducts && isCreatingRealProduct &&
					<>
						{this.renderAsyncSelect( 'productCategory', labels.productCategory, searchCategories, this.handleSubmitProductCategory, defaultCategories, labels.searchCategoryPlaceholder )}
						{this.renderInput( 'sku', labels.sku )}
						{this.renderSelect( 'manageStock', labels.manageStock, enabledSelectOptions )}
						{manageStockEnabled && this.renderInput( 'quantityInStock', labels.quantityInStock, '', 'number' )}
					</>
				}

				{this.renderButton( labels.createProduct, { onClick: this.doSubmit, className: 'yith-pos-new-product__submit_form' } )}
			</form>
		);
	}
}

export default ProductAddNewForm;
