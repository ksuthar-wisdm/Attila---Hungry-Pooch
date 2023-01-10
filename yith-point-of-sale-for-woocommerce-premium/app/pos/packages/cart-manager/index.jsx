import crypto              from 'crypto';
import _                   from 'lodash';
import { addQueryArgs }    from '@wordpress/url';
import apiFetch            from '@wordpress/api-fetch';
import { __, _x, sprintf } from '@wordpress/i18n';
import { applyFilters }    from '@wordpress/hooks';

import {
	calcTax,
	getTaxRates,
	priceIncludesTax,
	setCartItemTaxRates,
	showPriceIncludingTax,
	showTaxRow,
	taxEnabled,
	getTaxRoundingMode
}                                                               from '../taxes';
import {
	getMaxQuantity,
	getProductImageAlt,
	getProductImageUrl
}                                                               from '../products';
import {
	addNumberPrecision,
	arraySum,
	floatSum,
	parseStringPrice,
	removeNumberPrecision,
	roundIntPrice,
	roundPrice,
	uniqueID
}                                                               from '../numbers';
import { CartDiscounts }                                        from './cart-discounts';
import {
	isLoggerEnabled,
	loggerStore
}                                                               from '../../components/logger';
import Customer                                                 from './records/customer';
import { mapMap }                                               from '../utils';
import { PosError }                                             from '../errors';
import { getPaymentMethodTitle }                                from '../gateways';
import { getCustomerVAT }                                       from '../customers';
import { getCoupon }                                            from './records/coupon';
import { getUniqueDiscountCouponCode, isPosDiscountCouponCode } from '../data';

const CART_RAW_CART_ITEM_KEY_FILTER = 'yith_pos_cart_raw_cart_item_key';
const CART_GENERATED_ORDER_FILTER   = 'yith_pos_cart_generated_order';

export class CartManager {
	#cart = {};

	#totals = {
		feesTotal        : 0,
		feesTotalTax     : 0,
		itemsSubtotal    : 0,
		itemsSubtotalTax : 0,
		itemsTotal       : 0,
		itemsTotalTax    : 0,
		total            : 0,
		totalTax         : 0,
		subtotal         : 0,
		subtotalTax      : 0,
		shippingTotal    : 0,
		shippingTotalTax : 0,
		discountsTotal   : 0,
		discountsTotalTax: 0
	};

	#appliedFees    = [];
	#appliedCoupons = [];

	#couponDiscountTotals    = [];
	#couponDiscountTaxTotals = [];

	constructor( cart = {}, { generateCartID = false } = {} ) {
		this.#cart = _.cloneDeep( cart );
		this.#cart = Object.assign( CartManager.getEmptyCart( generateCartID ), this.#cart );
		this.calculate();
	}

	/** ----------------------------------------------------
	 * Static methods
	 */
	static generateCartID() {

		const key = String( yithPosSettings.register.id ) + uniqueID();

		return key;
	}

	static generateCartItemKey( item ) {
		const key = applyFilters( CART_RAW_CART_ITEM_KEY_FILTER, item.type + item.id, item );
		return crypto.createHash( 'md5' ).update( key ).digest( 'hex' );
	}

	static getEmptyCart( generateCartID = true ) {
		return {
			id              : generateCartID ? CartManager.generateCartID() : '',
			cartItems       : [],
			note            : '',
			saveReasonNote  : '',
			feesAndDiscounts: [],
			shippingMethods : [],
			coupons         : [],
			customer        : Customer()
		};
	}

	static getItemProductData = ( product ) => {
		const { type } = product;
		return {
			id           : product.id,
			name         : product.name,
			imageUrl     : getProductImageUrl( product ),
			imageAlt     : getProductImageAlt( product ),
			price        : parseStringPrice( product.price ),
			originalPrice: parseStringPrice( product.price ),
			meta         : type === 'variation' ? product.attributes : [],
			note         : '',
			productType  : type,
			type         : 'product',
			product      : product
		};
	};

	static getItemTaxClass( item ) {
		if ( typeof item !== 'undefined' && typeof item.product !== 'undefined' && 'taxable' === item.product.tax_status && typeof item.product.tax_class !== 'undefined' ) {
			return item.product.tax_class;
		}
		return false;
	};

	static reduceListSum( items, key ) {
		const reduce = ( tot, item ) => {
			return tot + item[ key ]
		};
		return items.reduce( reduce, 0 );
	}

	/** ----------------------------------------------------
	 * Private Getters
	 */
	_getCartItems = () => {
		return this.#cart.cartItems;
	};

	_getCartFeesAndDiscounts = () => {
		return this.#cart.feesAndDiscounts;
	};

	_getCartShippingMethods = () => {
		return this.#cart.shippingMethods;
	};

	_getCartCoupons = () => {
		return this.#cart.coupons;
	};

	/** ----------------------------------------------------
	 * Getters
	 */

	getCart = () => {
		return _.cloneDeep( this.#cart );
	};

	getCartID = () => {
		return this.getCart().id;
	};


	getCartItems = () => {
		return this.getCart().cartItems;
	};

	searchItem = ( cartItemKey ) => {
		let currentItems = this._getCartItems();
		return currentItems.findIndex( i => i.cartItemKey === cartItemKey );
	};

	getCartItem = ( cartItemKey ) => {
		let currentItems = this._getCartItems();
		const index      = this.searchItem( cartItemKey );

		if ( index >= 0 ) {
			return _.cloneDeep( currentItems[ index ] );
		}
		return undefined;
	};

	getCartItemAttr = ( cartItemKey, attr ) => {
		let currentItems = this._getCartItems();
		const index      = this.searchItem( cartItemKey );

		if ( index >= 0 ) {
			const item = currentItems[ index ];
			if ( attr in item ) {
				return _.cloneDeep( item[ attr ] );
			}
		}
		return undefined;
	};

	getNote = () => {
		return this.#cart.note;
	};

	getTotals = () => {
		const subtotal = [
			{
				id       : 'subtotal',
				type     : 'subtotal',
				label    : __( 'Subtotal', 'yith-point-of-sale-for-woocommerce' ),
				price    : this.getTotal( 'subtotal' ),
				editable : false,
				removable: false
			}
		];

		const tax = [
			{
				id       : 'tax',
				type     : 'tax',
				label    : __( 'Tax', 'yith-point-of-sale-for-woocommerce' ),
				price    : this.getTotal( 'totalTax' ),
				editable : false,
				removable: false
			}
		];

		const subtotalTaxIncl = [
			{
				id       : 'subtotal',
				type     : 'subtotal',
				label    : __( 'Subtotal (incl. tax)', 'yith-point-of-sale-for-woocommerce' ),
				price    : this.getTotal( 'subtotal' ) + this.getTotal( 'subtotalTax' ),
				editable : false,
				removable: false
			}
		];

		const total = [
			{
				id       : 'total',
				type     : 'total',
				label    : __( 'Total', 'yith-point-of-sale-for-woocommerce' ),
				price    : this.getTotal( 'total' ),
				editable : false,
				removable: false
			}
		];

		const appliedFeesTotals = this.getAppliedFeesTotals();
		const shippingTotals    = this.getShippingTotals();
		const couponTotals      = this.getCouponTotals();

		let totals = [];


		if ( taxEnabled() && showPriceIncludingTax() ) {
			totals = totals.concat( subtotalTaxIncl, couponTotals, shippingTotals );
		} else {
			totals = totals.concat( subtotal, couponTotals, shippingTotals );
		}

		if ( showTaxRow() ) {
			totals = totals.concat( tax );
		}

		totals = totals.concat( appliedFeesTotals, total );

		return totals;

	};

	getCouponTotals = () => {
		const reduce = ( acc, coupon ) => {

			let label = __( 'COUPON', 'yith-point-of-sale-for-woocommerce' ) + ' - ' + coupon.code;
			let type  = 'coupon';

			if ( isPosDiscountCouponCode( coupon.code ) ) {
				label = `${__( 'Discount', 'yith-point-of-sale-for-woocommerce' )} - ${coupon.description}`;
				type  = 'discount';
			}

			if ( coupon.error ) {
				label += ` - ${coupon.error}`;
				type = 'invalid-coupon';
			}

			const price = !showTaxRow() && coupon.tax ? floatSum( coupon.amount, coupon.tax ) : coupon.amount;
			return acc.concat( [{
				id       : 'coupon-' + coupon.id,
				type     : type,
				label    : label,
				price    : price,
				editable : 'discount' === type,
				removable: true,
				key      : coupon.code
			}] );
		};

		return this.#appliedCoupons.reduce( reduce, [] );
	};

	getAppliedFeesTotals = () => {
		const reduce = ( acc, fee ) => {
			const isFee        = fee.type === 'fee';
			const defaultLabel = isFee ? __( 'Fee', 'yith-point-of-sale-for-woocommerce' ) : __( 'Discount', 'yith-point-of-sale-for-woocommerce' );
			return acc.concat( [{
				id       : fee.type + '-' + fee.key,
				type     : fee.type,
				label    : ( fee.reason !== '' ? defaultLabel + ' - ' + fee.reason : defaultLabel ) || defaultLabel,
				price    : isFee ? fee.appliedAmount : fee.appliedAmount * ( -1 ),
				editable : true,
				removable: true,
				key      : fee.key
			}] );
		};
		return this.#appliedFees.reduce( reduce, [] );
	};


	getShippingTotals = () => {
		return this._getCartShippingMethods().map( shipping => {
			const label = __( 'Shipping', 'yith-point-of-sale-for-woocommerce' ) + ' - ' + shipping.title;
			const price = !showTaxRow() && shipping.tax ? floatSum( shipping.amount, shipping.tax ) : shipping.amount;
			return {
				id       : shipping.type + '-' + shipping.key,
				type     : 'shipping',
				label    : label,
				price    : price,
				editable : true,
				removable: true,
				key      : shipping.key
			};
		} );
	};

	/** ----------------------------------------------------
	 * Setters and Editors for Cart Items
	 */
	addCartItem = ( item, qty = 1 ) => {
		const cartItemKey = CartManager.generateCartItemKey( item );
		item.cartItemKey  = cartItemKey;
		let currentItems  = this._getCartItems();

		const max = getMaxQuantity( item, currentItems );

		if ( max > 0 && qty > max ) {
			const error = sprintf( __( 'You cannot add %s "%s" to your cart', 'yith-point-of-sale-for-woocommerce' ), qty, item.product.name );
			throw new PosError( error );
		}

		const index = this.searchItem( cartItemKey );

		if ( index >= 0 ) {
			const newQuantity = currentItems[ index ].qty + qty;
			if ( max === 0 || newQuantity <= max ) {
				currentItems[ index ].qty += qty;
			} else {
				const error = sprintf( __( 'You cannot add another "%s" to your cart', 'yith-point-of-sale-for-woocommerce' ), item.product.name );
				throw new PosError( error );
			}

		} else {
			item.qty = qty;
			item     = setCartItemTaxRates( item );
			currentItems.push( item );
		}

		loggerStore.addLog( 'last-added-item', 'Last Added Item', item );

		this.update();
	};

	removeCartItem = ( cartItemKey ) => {
		let currentItems = this._getCartItems();
		const index      = this.searchItem( cartItemKey );

		if ( index >= 0 ) {
			currentItems.splice( index, 1 );
			this.update();
			return true;
		}
		return false;
	};

	editCartItem = ( cartItemKey, attr ) => {
		let currentItems = this._getCartItems();
		const index      = this.searchItem( cartItemKey );

		if ( index >= 0 ) {
			currentItems[ index ] = Object.assign( {}, currentItems[ index ], attr );
			this.update();
			return true;
		}
		return false;
	};

	/** ----------------------------------------------------
	 * Setters and Editors for Cart Fees and Discounts
	 */
	searchFeeOrDiscount = ( key ) => {
		let items = this._getCartFeesAndDiscounts();
		return items.findIndex( i => i.key === key );
	};

	addFeeOrDiscount = ( item ) => {
		let currentItems  = this._getCartFeesAndDiscounts();

		const defaultItem = {
			key       : Date.now(),
			type      : 'fee',
			amount    : 0,
			percentage: false,
			reason    : '',
		};

		item        = Object.assign( defaultItem, item );
		item.amount = parseFloat( item.amount );

		if ( 'discount' === item.type ) {
			const couponKey  = getUniqueDiscountCouponCode();
			const couponData = {
				id           : couponKey,
				code         : couponKey,
				amount       : item.amount,
				discount_type: item.percentage ? 'percent' : 'fixed_cart',
				description  : item.reason,
				/* Added by WisdmLabs */
				is_points    : item.is_points ?? 0,
				points       : item.points ?? false
				/* Added by WisdmLabs */
			};

			this.addCoupon( couponData );

			return couponData.code;
		} else {
			currentItems.push( item );
			this.update();

			return item.key;
		}
	};

	removeFeeOrDiscount = ( key ) => {
		if ( isPosDiscountCouponCode( key ) ) {
			return this.removeCoupon( key );
		}
		let currentItems = this._getCartFeesAndDiscounts();
		const index      = this.searchFeeOrDiscount( key );
		if ( index >= 0 ) {
			currentItems.splice( index, 1 );
			this.update();
			return true;
		}
		return false;
	};

	editFeeOrDiscount = ( key, attr ) => {
		if ( isPosDiscountCouponCode( key ) ) {
			const couponData = {
				id           : key,
				code         : key,
				amount       : attr.amount,
				discount_type: attr.percentage ? 'percent' : 'fixed_cart',
				description  : attr.reason,
				/* Added by WisdmLabs */
				is_points    : attr.is_points ?? 0,
				points       : attr.points ?? false
				/* Added by WisdmLabs */
			};
			return this.editCoupon( couponData );
		}
		let currentItems = this._getCartFeesAndDiscounts();
		const index      = this.searchFeeOrDiscount( key );

		if ( index >= 0 ) {
			if ( 'amount' in attr ) {
				attr.amount = parseFloat( attr.amount );
			}
			currentItems[ index ] = Object.assign( {}, currentItems[ index ], attr );
			this.update();
			return true;
		}
		return false;
	};

	getFeeOrDiscount = ( key ) => {
		if ( isPosDiscountCouponCode( key ) ) {
			const coupon = this.getCoupon( key );
			if ( coupon ) {
				return {
					key       : key,
					type      : 'discount',
					typeAmount: coupon.discount_type !== 'fixed_cart' ? 'percentage' : 'fixed',
					amount    : coupon.amount,
					percentage: coupon.discount_type !== 'fixed_cart',
					reason    : coupon.description
				};
			} else {
				return false;
			}
		}

		let currentItems = this._getCartFeesAndDiscounts();
		const index      = this.searchFeeOrDiscount( key );

		if ( index >= 0 ) {
			return _.clone( currentItems[ index ] );
		}
		return false;
	};

	/** ----------------------------------------------------
	 * Setters and Editors for Shipping Methods
	 */

	searchShippingMethod = ( key ) => {
		let items = this._getCartShippingMethods();
		return items.findIndex( i => i.key === key );
	};

	addShippingMethod = ( item ) => {
		let currentItems  = this._getCartShippingMethods();
		const defaultItem = {
			key   : Date.now(),
			type  : 'shipping',
			method: '',
			title : '',
			amount: 0
		};

		item        = Object.assign( defaultItem, item );
		item.amount = parseFloat( item.amount );

		currentItems.push( item );
		this.update();

		return item.key;
	};

	removeShippingMethod = ( key ) => {
		let currentItems = this._getCartShippingMethods();
		const index      = this.searchShippingMethod( key );
		if ( index >= 0 ) {
			currentItems.splice( index, 1 );
			this.update();
			return true;
		}
		return false;
	};

	editShippingMethod = ( key, attr ) => {
		let currentItems = this._getCartShippingMethods();
		const index      = this.searchShippingMethod( key );

		if ( index >= 0 ) {
			if ( 'amount' in attr ) {
				attr.amount = parseFloat( attr.amount );
			}
			currentItems[ index ] = Object.assign( {}, currentItems[ index ], attr );
			this.update();
			return true;
		}
		return false;
	};

	getShippingMethod = ( key ) => {
		let currentItems = this._getCartShippingMethods();
		const index      = this.searchShippingMethod( key );

		if ( index >= 0 ) {
			return _.clone( currentItems[ index ] );
		}
		return false;
	};

	/** ----------------------------------------------------
	 * Setters and Editors for Coupons
	 */
	searchCoupon = ( code ) => {
		let coupons = this._getCartCoupons();
		return coupons.findIndex( i => i.code === code );
	};

	addCoupon = ( coupon ) => {
		coupon = getCoupon( coupon );
		if ( this.searchCoupon( coupon.code ) < 0 ) {
			let coupons = this._getCartCoupons();
			coupons.push( coupon );
			this.update();
		}
	};

	editCoupon = ( coupon ) => {
		const { code } = coupon;
		let coupons    = this._getCartCoupons();
		const index    = this.searchCoupon( code );
		if ( index >= 0 ) {
			coupons[ index ] = { ...coupons[ index ], ...coupon };
			this.update();
			return true;
		}
		return false;
	};

	removeCoupon = ( code ) => {
		let coupons = this._getCartCoupons();
		const index = this.searchCoupon( code );
		if ( index >= 0 ) {
			coupons.splice( index, 1 );
			this.update();
			return true;
		}
		return false;
	};

	getCoupon = ( code ) => {
		let coupons = this._getCartCoupons();
		const index = this.searchCoupon( code );

		if ( index >= 0 ) {
			return _.clone( coupons[ index ] );
		}
		return false;
	};

	searchAppliedCoupon = ( code ) => {
		const coupons = this.#appliedCoupons;
		return coupons.findIndex( i => i.code === code );
	};

	getAppliedCoupon = ( code ) => {
		const coupons = this.#appliedCoupons;
		const index   = this.searchAppliedCoupon( code );

		if ( index >= 0 ) {
			return _.clone( coupons[ index ] );
		}
		return false;
	};

	/** ----------------------------------------------------
	 * Setters and Editors for Customer
	 */
	setCartCustomer = ( customer ) => {
		this.#cart.customer = Customer( customer );
		this.update();
	};

	getCartCustomer = () => {
		return _.cloneDeep( this.#cart.customer );
	};

	/** ----------------------------------------------------
	 * Setters and Editors for Cart
	 */
	emptyCart = () => {
		this.#cart = CartManager.getEmptyCart();
		this.update();
	};

	setNote = ( note ) => {
		this.#cart.note = note;
	};

	setSaveReasonNote = ( note ) => {
		this.#cart.saveReasonNote = note;
	};

	/** ----------------------------------------------------
	 * Conditionals
	 */
	isEmpty = () => {
		return this._getCartItems().length === 0;
	};

	/** ----------------------------------------------------
	 *  Operations
	 */

	update = () => {
		this.calculate();
	};

	/** ----------------------------------------------------
	 *  Totals
	 */

	_setTotal = ( key, value ) => {
		this.#totals[ key ] = value;
	};

	_calculateLog = () => {
		if ( isLoggerEnabled() ) {
			loggerStore.addLog( 'cart-totals', 'Cart Totals', this.#totals );
			loggerStore.addLog( 'order', 'Order', this.generateOrder() );

			const itemTotals = this.getCartItems().map( ( item ) => {
				return {
					cartItemKey     : item.cartItemKey,
					id              : item.id,
					name            : item.name,
					qty             : item.qty,
					linePriceInCents: item.linePrice,
					linePrice       : removeNumberPrecision( item.linePrice ),
					lineSubtotal    : item.lineSubtotal,
					lineSubtotalTax : item.lineSubtotalTax,
					lineTotal       : item.lineTotal,
					lineTotalTax    : item.lineTotalTax
				};
			} );

			loggerStore.addLog( 'item-totals', 'Item Totals', itemTotals );
		}
	};

	calculate = () => {
		this.calculateItemTotals();
		this.calculateFeesTotals();
		this.calculateShippingTotals();

		this.calculateTotals();

		this._calculateLog();
	};

	getDiscountedPriceInCents = ( cartItemKey ) => {
		const item = this.getCartItem( cartItemKey );
		return cartItemKey in this.#couponDiscountTotals ?
			   item.linePrice - this.#couponDiscountTotals[ cartItemKey ] :
			   item.linePrice;
	};

	calculateDiscounts = () => {
		const discounts      = new CartDiscounts( this );
		const coupons        = this._getCartCoupons();
		this.#appliedCoupons = [];

		discounts.applyCoupons( _.cloneDeep( coupons ) );

		let couponDiscountAmounts    = discounts.getDiscountsByCoupon( true );
		let couponDiscountTaxAmounts = [];
		const invalidCoupons         = discounts.getInvalidCoupons();

		if ( taxEnabled() ) {
			_.each( discounts.getDiscounts( true ), ( couponDiscounts, couponCode ) => {
				couponDiscountTaxAmounts[ couponCode ] = 0;
				_.each( couponDiscounts, ( couponDiscount, cartItemKey ) => {
					const item         = this.getCartItem( cartItemKey );
					const itemTaxClass = CartManager.getItemTaxClass( item );
					if ( itemTaxClass !== false ) {
						const taxRates  = getTaxRates( itemTaxClass );
						const couponTax = roundIntPrice( arraySum( calcTax( couponDiscount, taxRates ) ) );

						couponDiscountTaxAmounts[ couponCode ] += couponTax;

						if ( priceIncludesTax() ) {
							couponDiscountAmounts[ couponCode ] -= couponTax;
						}
					}
				} );
			} );
		}

		this.#couponDiscountTotals    = discounts.getDiscountsByItem( true );
		this.#couponDiscountTaxTotals = couponDiscountTaxAmounts.splice();


		coupons.forEach( ( coupon ) => {
			if ( coupon.code in couponDiscountAmounts ) {
				this.#appliedCoupons.push( {
											   id         : coupon.id,
											   code       : coupon.code,
											   amount     : removeNumberPrecision( couponDiscountAmounts[ coupon.code ] ),
											   tax        : removeNumberPrecision( couponDiscountTaxAmounts[ coupon.code ] ),
											   description: coupon?.description ?? ''
										   } );
			} else if ( coupon.code in invalidCoupons ) {
				const invalidCoupon = invalidCoupons[ coupon.code ];
				this.#appliedCoupons.push( {
											   id         : invalidCoupon.id,
											   code       : invalidCoupon.code,
											   amount     : '',
											   tax        : '',
											   description: coupon?.description ?? '',
											   error      : invalidCoupon.error
										   } );
			}
		} );

		const totalDiscounts    = removeNumberPrecision( arraySum( Object.values( couponDiscountAmounts ) ) );
		const totalTaxDiscounts = removeNumberPrecision( arraySum( Object.values( couponDiscountTaxAmounts ) ) );

		this._setTotal( 'discountsTotal', totalDiscounts );
		this._setTotal( 'discountsTotalTax', totalTaxDiscounts );
	};

	calculateTotals = () => {
		const taxes = this.getTotal( 'itemsTotalTax' ) + this.getTotal( 'feesTotalTax' ) + this.getTotal( 'shippingTotalTax' );
		const total = this.getTotal( 'itemsTotal' ) + this.getTotal( 'feesTotal' ) + this.getTotal( 'shippingTotal' );
		this._setTotal( 'total', Math.max( 0, roundPrice( total + taxes ) ) );
		this._setTotal( 'totalTax', Math.max( 0, roundPrice( taxes ) ) );
	};

	calculateItemSubtotals = () => {
		const items              = this._getCartItems();
		let itemsSubtotalInCents = 0;
		let mergedSubtotalTaxes  = new Map();
		items.map( ( item ) => {
			const { price, product, qty }   = item;
			const { tax_class, tax_status } = product;
			const isTaxable                 = 'taxable' === tax_status;
			let itemPrice                   = price * qty;
			let tax                         = 0;
			let taxes;

			itemPrice      = addNumberPrecision( itemPrice );
			item.linePrice = itemPrice;

			if ( taxEnabled() && isTaxable ) {
				const taxRates = getTaxRates( tax_class );
				taxes          = calcTax( itemPrice, taxRates );
				tax            = arraySum( mapMap( taxes, this.roundLineTax ) );

				if ( priceIncludesTax() ) {
					itemPrice = itemPrice - arraySum( taxes );
					// re-calculate taxes from net-price to avoid rounding issues
					//taxes     = calcTax( itemPrice, taxRates, false );
					//tax       = arraySum( mapMap( taxes, this.roundLineTax ) );
				}

				taxes.forEach( ( value, key, map ) => {
					if ( !mergedSubtotalTaxes.has( key ) ) {
						mergedSubtotalTaxes.set( key, 0 );
					}
					const prev = mergedSubtotalTaxes.get( key );

					mergedSubtotalTaxes.set( key, prev + this.roundLineTax( value ) );
				} );
			}

			itemsSubtotalInCents += this.roundLineSubtotal( itemPrice );
			item.lineSubtotal    = removeNumberPrecision( itemPrice );
			item.lineSubtotalTax = removeNumberPrecision( tax );
		} );

		this._setTotal( 'itemsSubtotal', removeNumberPrecision( roundIntPrice( itemsSubtotalInCents ) ) );
		this._setTotal( 'itemsSubtotalTax', removeNumberPrecision( roundIntPrice( arraySum( mergedSubtotalTaxes ), getTaxRoundingMode() ) ) );

		this._setTotal( 'subtotal', roundPrice( this.getTotal( 'itemsSubtotal' ) ) );
		this._setTotal( 'subtotalTax', roundPrice( this.getTotal( 'itemsSubtotalTax' ), false, getTaxRoundingMode() ) );
	};

	calculateItemTotals = () => {
		this.calculateItemSubtotals();
		this.calculateDiscounts();

		const items              = this._getCartItems();
		let itemsTotalInCents    = 0;
		let itemsTotalTaxInCents = 0;

		items.map( ( item ) => {
			const { product, cartItemKey }  = item;
			const { tax_class, tax_status } = product;
			const isTaxable                 = 'taxable' === tax_status;
			let total                       = this.getDiscountedPriceInCents( cartItemKey );
			let totalTax                    = 0;
			let taxes;

			if ( taxEnabled() && isTaxable ) {
				const taxRates = getTaxRates( tax_class );
				taxes          = calcTax( total, taxRates );
				totalTax       = arraySum( mapMap( taxes, this.roundLineTax ) );
				if ( priceIncludesTax() ) {
					total = total - arraySum( taxes );
					// re-calculate taxes from net-price to avoid rounding issues
					//taxes    = calcTax( total, taxRates, false );
					//totalTax = arraySum( mapMap( taxes, this.roundLineTax ) );
				}
			}

			item.lineTotal    = removeNumberPrecision( total );
			item.lineTotalTax = removeNumberPrecision( totalTax );

			itemsTotalInCents += this.roundLineSubtotal( total );
			itemsTotalTaxInCents += totalTax;
		} );

		const total    = removeNumberPrecision( roundIntPrice( itemsTotalInCents ) );
		const totalTax = removeNumberPrecision( roundIntPrice( itemsTotalTaxInCents, getTaxRoundingMode() ) );

		this._setTotal( 'itemsTotal', total );
		this._setTotal( 'itemsTotalTax', totalTax );
	};

	calculateFeesTotals = () => {
		const fees             = this._getCartFeesAndDiscounts();
		const itemsTotalIncTax = this.getTotal( 'itemsTotal' ) + this.getTotal( 'itemsTotalTax' );
		let i, feesTotal       = 0;

		let preFeeTotal   = addNumberPrecision( itemsTotalIncTax );
		this.#appliedFees = [];
		for ( i in fees ) {
			const fee       = fees[ i ];
			const feeAmount = fee.percentage ? fee.amount : addNumberPrecision( fee.amount );
			let amount;

			if ( fee.percentage ) {
				amount = preFeeTotal * feeAmount / 100;
			} else {
				amount = feeAmount;
			}

			if ( fee.type === 'discount' ) {
				amount *= -1;
			}

			preFeeTotal += amount;
			feesTotal += amount;

			this.#appliedFees.push( Object.assign( {}, fee, { appliedAmount: removeNumberPrecision( amount ) } ) );
		}
		this._setTotal( 'feesTotal', removeNumberPrecision( roundIntPrice( feesTotal ) ) );
	};

	getItemsTaxClasses = () => {
		const items      = this.getCartItems();
		const taxClasses = new Set();
		items.forEach( ( item ) => {
			const itemTaxClass = CartManager.getItemTaxClass( item );
			if ( itemTaxClass !== false ) {
				taxClasses.add( itemTaxClass );
			}
		} );
		return Array.from( taxClasses );
	};

	calculateShippingTotals = () => {
		const shipping       = this._getCartShippingMethods();
		let i, shippingTotal = 0, shippingTotalTax = 0;
		let shippingTaxClass = yithPosSettings.tax.shippingTaxClass;
		if ( taxEnabled() && 'inherit' === shippingTaxClass ) {
			const classes    = this.getItemsTaxClasses();
			shippingTaxClass = classes.length > 0 ? classes[ 0 ] : false;
		}

		for ( i in shipping ) {
			const shippingItem = shipping[ i ];
			const amount       = addNumberPrecision( shippingItem.amount );
			shippingTotal += amount;
			shipping[ i ].tax  = 0;

			if ( taxEnabled() && shippingTaxClass !== false ) {
				const tax         = roundIntPrice( arraySum( calcTax( amount, getTaxRates( shippingTaxClass ), false ) ) );
				shippingTotalTax += tax;
				shipping[ i ].tax = removeNumberPrecision( tax );
			}
		}

		this._setTotal( 'shippingTotal', removeNumberPrecision( shippingTotal ) );
		this._setTotal( 'shippingTotalTax', removeNumberPrecision( shippingTotalTax ) );
	};

	getTotal = ( key ) => {
		return this.#totals[ key ];
	};

	totals = () => {
		return this.#totals;
	};

	getCartTotal() {
		return this.getTotal( 'total' );
	}

	getTestTotalWithFee( fee ) {
		const testCartManager = new CartManager( this.getCart() );
		if ( typeof fee.key === 'undefined' ) {
			testCartManager.addFeeOrDiscount( fee );
		} else {
			testCartManager.editFeeOrDiscount( fee.key, fee );
		}
		return testCartManager.getTotal( 'total' );
	}

	getTestTotalWithoutFee( fee ) {
		const testCartManager = new CartManager( this.getCart() );
		if ( typeof fee.key !== 'undefined' ) {
			testCartManager.removeFeeOrDiscount( fee.key );
		}
		return testCartManager.getTotal( 'total' );
	}

	getTestTotalWithShipping( shipping ) {
		const testCartManager = new CartManager( this.getCart() );
		if ( typeof shipping.key === 'undefined' ) {
			testCartManager.addShippingMethod( shipping );
		} else {
			testCartManager.editShippingMethod( shipping.key, shipping );
		}
		return testCartManager.getTotal( 'total' );
	}

	getTestTotalWithoutShipping( shipping ) {
		const testCartManager = new CartManager( this.getCart() );
		if ( typeof shipping.key !== 'undefined' ) {
			testCartManager.removeShippingMethod( shipping.key );
		}
		return testCartManager.getTotal( 'total' );
	}

	getTestTotalWithCoupon( coupon ) {
		const testCartManager = new CartManager( this.getCart() );
		coupon                = getCoupon( coupon );
		if ( testCartManager.searchCoupon( coupon.code ) >= 0 ) {
			return new Error( __( 'Coupon already applied!', 'yith-point-of-sale-for-woocommerce' ) );
		} else {
			testCartManager.addCoupon( coupon );
			const appliedCoupon = testCartManager.getAppliedCoupon( coupon.code );
			if ( !appliedCoupon ) {
				return new Error( __( 'The coupon was not applied!', 'yith-point-of-sale-for-woocommerce' ) );
			} else {
				if ( appliedCoupon.error ) {
					return new Error( appliedCoupon.error );
				}
			}
		}
		return testCartManager.getTotal( 'total' );
	}

	/**
	 * Rounding
	 */
	roundAtSubtotal = () => {
		return yithPosSettings.tax.roundAtSubtotal;
	};

	roundLineTax = ( value ) => {
		if ( !this.roundAtSubtotal() ) {
			value = roundIntPrice( value, getTaxRoundingMode() );
		}
		return value;
	};

	roundLineSubtotal = ( value ) => {
		if ( !this.roundAtSubtotal() ) {
			value = roundIntPrice( value );
		}
		return value;
	};

	/**
	 * Order
	 */
	generateOrderLineItems = () => {
		const cartItems = this.getCartItems();

		return cartItems.map( item => {
			let orderItem = {
					product_id: item.id,
					quantity  : item.qty,
					subtotal  : item.lineSubtotal.toString(),
					total     : item.lineTotal.toString()
				},
				metaData  = [];

			if ( typeof item.product !== 'undefined' && item.product.isPosCustomProduct ) {
				orderItem.name       = item.product.name;
				orderItem.tax_status = item.product.tax_status;
				orderItem.tax_class  = item.product.tax_class;
				metaData.push( { key: 'yith_pos_custom_product', value: true } )
			}

			if ( item.note ) {
				metaData.push( { key: 'yith_pos_order_item_note', value: item.note } );
			}

			if ( metaData.length ) {
				orderItem.meta_data = metaData;
			}

			return orderItem;
		} );
	};

	generateOrderFeeLines = () => {
		return this.#appliedFees.map( fee => {
			const isFee        = fee.type === 'fee';
			const defaultLabel = isFee ? __( 'Fee', 'yith-point-of-sale-for-woocommerce' ) : __( 'Discount', 'yith-point-of-sale-for-woocommerce' );
			let amount         = fee.appliedAmount;

			return {
				name      : defaultLabel + ' - ' + fee.reason || defaultLabel,
				tax_status: 'none',
				total     : roundPrice( amount ).toString(),
				meta_data : [
					{ key: '_yith_pos_fee_type', value: fee.type }
				]
			}
		} );
	};

	generateOrderCouponLines = () => {
		return this.#appliedCoupons.reduce( ( acc, coupon ) => {
			if ( !coupon.error ) {
				acc = acc.concat( [{
					code: coupon.code
				}] )
			}
			return acc;
		}, [] );
	};

	generateOrderShippingLines = () => {
		return this._getCartShippingMethods().map( shipping => {
			const title = __( 'Shipping', 'yith-point-of-sale-for-woocommerce' ) + ' - ' + shipping.title;
			return {
				method_id   : shipping.method,
				method_title: title,
				total       : roundPrice( shipping.amount ).toString()
			}
		} );
	};

	generateOrder = ( params = {} ) => {
		const customer = this.getCartCustomer();
		const vat      = getCustomerVAT( customer );

		// Note: the email is required in billing address, so if the customer has not set it, we can use the user email
		if ( typeof customer.billing.email !== 'undefined' && !customer.billing.email && typeof customer.email !== 'undefined' ) {
			customer.billing.email = customer.email;
		}

		let order = {
			payment_method: 'bacs',
			set_paid      : true,
			customer_id   : customer.id,
			billing       : customer.billing.email ? customer.billing : {},
			shipping      : customer.shipping,
			line_items    : this.generateOrderLineItems(),
			fee_lines     : this.generateOrderFeeLines(),
			coupon_lines  : this.generateOrderCouponLines(),
			shipping_lines: this.generateOrderShippingLines(),
			customer_note : this.getNote(),
			meta_data     : []
		};

		const orderMeta = [
			{ key: '_yith_pos_order', value: '1' },
			{ key: '_yith_pos_store', value: String( yithPosSettings.store.id ) },
			{ key: '_yith_pos_register', value: String( yithPosSettings.register.id ) },
			{ key: '_yith_pos_cashier', value: String( yithPosSettings.user.id ) }
		];

		/* Added by WisdmLabs */
		let points         = false;
		let pointsDiscount = 0;
		this._getCartCoupons().map( ( coupon, i ) => {
			if ( coupon.is_points && coupon.points ) {
				points         = coupon.points;
				pointsDiscount = coupon.amount;
			}
		} );

		if ( points && pointsDiscount > 0 ) {
			orderMeta.push( {
				key: '_wdm_yith_pos_points',
				value: Number( points )
			} );
			orderMeta.push( {
				key: '_wdm_yith_pos_points_discount',
				value: pointsDiscount
			} );
		}

		/* Added by WisdmLabs */

		if ( vat ) {
			orderMeta.push( { key: '_billing_vat', value: vat } );
		}

		order                      = Object.assign( {}, order, params );
		order.meta_data            = order.meta_data.concat( orderMeta );
		order.payment_method_title = getPaymentMethodTitle( order.payment_method );

		return applyFilters( CART_GENERATED_ORDER_FILTER, order, params, customer );
	};

	/**
	 * If there are POS discounts, generate coupons through REST API
	 * and return a promise.
	 * @returns {Promise}
	 */
	maybeGenerateDiscountCoupons = () => {
		const coupons         = this._getCartCoupons();
		const discountCoupons = coupons.filter( coupon => isPosDiscountCouponCode( coupon.code ) );

		if ( !discountCoupons.length ) {
			return new Promise( ( res, rej ) => res() );
		}

		return Promise.all(
			discountCoupons.map( coupon => {
				coupon.amount = typeof coupon.amount !== 'string' ? coupon.amount.toString() : coupon.amount;
				delete coupon.id;
				return apiFetch(
					{
						path  : addQueryArgs( '/wc/v3/coupons', { yith_pos_request: 'generate-discount-coupons' } ),
						data  : coupon,
						method: 'POST'
					}
				);
			} )
		);
	}

	/**
	 *
	 * @param paymentMethods
	 * @returns {Promise|*|Promise<void>|Promise<any>}
	 */
	processOrder = ( { paymentMethods = [], change = 0 } ) => {
		let paymentMethod = paymentMethods.length ? paymentMethods[ 0 ].paymentMethod : 'yith_pos_cash_gateway';
		let metaData      = [];

		let paymentGrouped = _.groupBy( paymentMethods, ( pm ) => pm.paymentMethod );

		let filteredPaymentMethods = [];
		paymentGrouped             = Object.entries( paymentGrouped ).map( ( [key, value] ) => ( { key, value } ) );
		paymentGrouped.forEach( method => {
			const amount = _.sumBy( method.value, ( m ) => parseFloat( m.amount ) || 0 );
			if ( amount ) {
				filteredPaymentMethods = [...filteredPaymentMethods, { paymentMethod: method.key, amount }];
			}
		} );

		filteredPaymentMethods.forEach( ( method ) => {
			metaData = [...metaData, { key: "_yith_pos_gateway_" + method.paymentMethod, value: String( method.amount ) }];
		} );

		if ( change ) {
			metaData = [...metaData, { key: "_yith_pos_change", value: change }];
		}

		const order = this.generateOrder( {
											  payment_method: paymentMethod,
											  meta_data     : metaData
										  } );

		return new Promise(
			( resolve, reject ) => {
				this.maybeGenerateDiscountCoupons().then(
					() => {
						const queryArgs = {
							lang            : yithPosSettings.language,
							yith_pos_request: 'create-order',
							yith_pos_context: 'cart',
							yith_pos_store  : yithPosSettings.store.id
						};
						apiFetch(
							{
								path  : addQueryArgs( '/wc/v3/orders', queryArgs ),
								data  : order,
								method: 'POST'
							}
						).then( resolve ).catch( reject );
					}
				).catch( () => {
					reject( { message: __( 'An error occurred while generating coupons for discounts applied to this order.', 'yith-point-of-sale-for-woocommerce' ) } );
				} )
			}
		);
	};
}
