/** global yithPosSettings */
import React, { Component, Fragment } from 'react';
import { connect }                    from "react-redux";
import { Route, Routes }              from 'react-router-dom';
import { __, _x, sprintf }            from '@wordpress/i18n';
import { format }                     from "@wordpress/date";
import { applyFilters, doAction }     from '@wordpress/hooks';

import PosHeader                from './pos-header.jsx';
import Cart                     from './cart.jsx';
import ControlledModal          from './common/controlled-modal.jsx';
import ProductVariationSelector from './products/product-variation-selector';
import CartAddNote              from './cart/cart-add-note';
import CartApplyCoupon          from './cart/cart-apply-coupon';
/* Added by WisdmLabs */
import CartRedeemPoints         from './cart/cart-redeem-points.jsx';
/* Added by WisdmLabs */
import CartAddFeeOrDiscount     from './cart/cart-add-fee-or-discount';
import CartSaveAddBox           from './cart/cart-save-add-box';
import CartPayment              from './cart/cart-payment';
import CartShipping             from './cart/cart-shipping';
import OrderHistory             from './orders/order-history';
import OrderDetails             from './orders/order-details';
import RegisterCashInHand       from './register/register-cash-in-hand';
import ProductAddNewForm        from "./products/product-add-new-form";
import ProductsSection          from './product-section';
import Confirm                  from './common/confirm';

import storage                                  from '../packages/storage';
import heartbeat                                from '../packages/heartbeat';
import { formatCurrency }                       from "../packages/numbers";
import { CartManager }                          from '../packages/cart-manager';
import Logger, { isLoggerEnabled, loggerStore } from './logger';
import { initUniqueID }                         from '../packages/numbers';
import { RegisterManager }                      from "../packages/register-manager";
import RegisterClose                            from "./register/register-close";
import { PosError }                             from '../packages/errors';

import { productUpdated }         from '../store/products/productsSlice';
import CustomerController         from './customer/customer-controller';
import { userCan, userCanError }  from '../packages/user';
import CustomerShippingModal      from './customer/customer-shipping-modal';
import RegisterSessionReports     from './register/register-session-reports';
import OrdersReports              from './orders/orders-reports';
import { downloadCashierReports } from '../packages/settings';

const DEFAULT_SCANNER_ACTIVE_FILTER                = 'yith_pos_scan_product_tab_active_default';
const ORDER_PROCESSED_AFTER_SHOWING_DETAILS_ACTION = 'yith_pos_order_processed_after_showing_details';

class App extends Component {

	constructor() {
		super( ...arguments );
		this.state = {
			carts                    : storage.get( 'carts', [{}] ),
			currentCart              : storage.get( 'currentCart', 0 ),
			currentCartID            : '',
			scannerActive            : applyFilters( DEFAULT_SCANNER_ACTIVE_FILTER, false ),
			showSavedCarts           : false,
			loadingLock              : false,
			isEditingCustomer        : false,
			isEditingCustomerShipping: false
		};

		this.controlledModalElement = React.createRef();
		this.register               = new RegisterManager();


		this._loadTheme();
		this._initCartManager();
	}


	/**  ----------------------------------------------------
	 * Lifecycle methods
	 */

	componentDidMount() {
		heartbeat();
		this.initUniqueID();

		if ( this.register.data.wasClosed ) {
			this.openCashInHand();
		}

		this._updateCurrentCart();
	}

	componentDidUpdate( prevProps, prevState ) {

		if ( prevState.carts !== this.state.carts ) {
			storage.set( 'carts', this.state.carts );
		}

		if ( prevState.currentCart !== this.state.currentCart ) {
			storage.set( 'currentCart', this.state.currentCart );
		}
	}

	// calculate the last cart id and init the unique ID
	initUniqueID = () => {
		let carts = this._getCarts();
		if ( carts.length > 0 ) {
			carts.sort( ( a, b ) => ( parseInt( a.id ) > parseInt( b.id ) ) ? 1 : -1 );
			const lastItem = carts.pop();
			if ( typeof lastItem.id !== 'undefined' ) {
				const id  = String( lastItem.id );
				const res = id.replace( yithPosSettings.register.id, '' );
				initUniqueID( res );
			}
		}
	}

	/** ----------------------------------------------------
	 * Private methods
	 */

	_getCarts = () => {
		const { carts } = this.state;
		return carts.slice( 0 );
	};

	_initCartManager = () => {
		const { currentCart } = this.state;
		const carts           = this._getCarts();
		const cart            = currentCart in carts ? carts[ currentCart ] : false;
		this.cartManager      = new CartManager( cart, { generateCartID: carts.length < 2 } );
	};

	_updateCurrentCart = () => {
		const { currentCart } = this.state;
		let carts             = this._getCarts();

		carts[ currentCart ] = this.cartManager.getCart();
		this.setState( { carts, currentCartID: this.cartManager.getCartID() } );
	};

	_loadTheme = () => {
		const color_scheme = yithPosSettings.color_scheme;
		Object.keys( color_scheme ).map( key => {
			const value = color_scheme[ key ];
			document.documentElement.style.setProperty( key, value );
		} );
	};


	/** ----------------------------------------------------
	 * Modal management
	 */
	openModal = ( content, title, className = '', closeButton = true ) => {
		this.controlledModalElement.current.open( content, title, className, closeButton );
	};

	closeModal = () => {
		this.controlledModalElement.current.close();
	};

	notice = ( message, confirmText, title = '' ) => {
		this.openModal(
			<Confirm message={message} confirmText={confirmText} cancelText="" onConfirm={this.closeModal}/>,
			title, '', false );
	};


	/** ----------------------------------------------------
	 * Register Cash in Hand
	 */
	openCashInHand = () => {
		let title = __( 'Add cash in hand', 'yith-point-of-sale-for-woocommerce' );

		if ( this.register.data.wasClosed ) {
			title = __( 'Open Register', 'yith-point-of-sale-for-woocommerce' );
		}

		this.openModal(
			<RegisterCashInHand onUndo={this.closeModal} setCashInHand={( amount, reason ) => {
				this.register.addCashInHand( amount, reason );
				this.closeModal()
			}}/>, title, 'modal-cash-in-hand', true
		);
	};


	/** ----------------------------------------------------
	 * Cart management
	 */
	addCartItemProductHandler = ( product, qty ) => {
		if ( 'variable' === product.type ) {
			if ( product.variations ) {
				this.openModal(
					<ProductVariationSelector variableId={product.id} variableProduct={product}
						addCartItem={( variation ) => {
							variation.type = 'variation';
							this.addCartItemProduct( variation );
							this.closeModal();
						}}/>,
					__( 'Choose variation', 'yith-point-of-sale-for-woocommerce' ), 'modal__variation-layout', true
				)

			} else {
				this.openModal(
					__( 'Variable product without variations', 'yith-point-of-sale-for-woocommerce' ),
					__( 'Error', 'yith-point-of-sale-for-woocommerce' ) );
			}
		} else {
			this.addCartItemProduct( product, qty );
		}
	};

	addCartItemProduct = ( product, qty = 1 ) => {
		this.showCurrentCart();
		const item = CartManager.getItemProductData( product );
		this.addCartItem( item, qty );
	};

	addCartItem = ( item, qty = 1 ) => {
		try {
			this.cartManager.addCartItem( item, qty );
			this.register.playSound();
			this._updateCurrentCart();
		} catch ( error ) {
			if ( error instanceof PosError ) {
				this.notice( sprintf( __( 'Error: %s', 'yith-point-of-sale-for-woocommerce' ), error.message ),
							 __( 'OK', 'yith-point-of-sale-for-woocommerce' ) );
			} else {
				throw error;
			}
		}
	};

	removeCartItem = ( cartItemKey ) => {
		if ( this.cartManager.removeCartItem( cartItemKey ) ) {
			this._updateCurrentCart();
		}
	};

	editCartItem = ( cartItemKey, attr ) => {
		if ( this.cartManager.editCartItem( cartItemKey, attr ) ) {
			this._updateCurrentCart();
		}
	};

	editCartItemQuantity = ( cartItemKey, qty ) => {
		let currentItems = this.cartManager._getCartItems();
		const index      = this.cartManager.searchItem( cartItemKey );

		if ( index >= 0 ) {
			if ( currentItems[ index ][ 'qty' ] !== qty ) {
				this.register.playSound();
			}
		}

		this.editCartItem( cartItemKey, { qty } )
	};

	editCartItemNote = ( cartItemKey, note ) => {
		this.editCartItem( cartItemKey, { note } )
	};

	resetCartItemPrice = ( cartItemKey ) => {
		const price = this.cartManager.getCartItemAttr( cartItemKey, 'originalPrice' );
		if ( typeof price !== 'undefined' ) {
			this.editCartItem( cartItemKey, { price } );
		}
	};

	editCartItemPrice = ( cartItemKey, amount, percentage = false ) => {
		let newPrice = false;
		if ( percentage ) {
			const price = this.cartManager.getCartItemAttr( cartItemKey, 'price' );
			if ( typeof price !== 'undefined' ) {
				newPrice = price - ( price * amount / 100 );
			}
		} else {
			newPrice = amount;
		}

		this.editCartItem( cartItemKey, { price: newPrice } );
	};

	emptyCurrentCart = () => {
		this.cartManager.emptyCart();
		this._updateCurrentCart();
	};

	//triggered by a click on tab cart
	showCurrentCart = () => {
		const { showSavedCarts } = this.state;
		showSavedCarts && this.setState( { showSavedCarts: false } );
	}

	emptyCurrentCartConfirm = () => {
		if ( !this.cartManager.isEmpty() ) {
			this.openModal(
				<Confirm
					message={__( 'Do you want to delete this cart and start from scratch?', 'yith-point-of-sale-for-woocommerce' )}
					confirmText={__( 'Yes', 'yith-point-of-sale-for-woocommerce' )}
					cancelText={__( 'No, continue with this cart', 'yith-point-of-sale-for-woocommerce' )}
					onConfirm={() => {
						this.emptyCurrentCart();
						this.closeModal()
					}}
					onCancel={this.closeModal}
				/>,
				'', '', false
			)
		}
	};

	getTestTotalWithCoupon = ( coupon ) => {
		return typeof coupon !== 'undefined' ? this.cartManager.getTestTotalWithCoupon( coupon ) : this.cartManager.getTotal( 'total' );
	};

	/** Save and Recovery Cart **/
	saveCartModal = () => {
		const title = __( 'Suspend and save cart', 'yith-point-of-sale-for-woocommerce' );
		this.openModal( <CartSaveAddBox onSave={this.saveCurrentCart}/>, title, 'cart-save', true );
	}

	savedCartAction = ( cart, actionName = 'reload' ) => {
		let message       = '';
		let cancelText    = '';
		const confirmText = __( 'Yes', 'yith-point-of-sale-for-woocommerce' );

		if ( actionName === 'reload' ) {

			if ( !this.cartManager.isEmpty() ) {
				message = sprintf( __( 'You have some items in your cart. Do you want to suspend your current cart and load the cart number#%s?', 'yith-point-of-sale-for-woocommerce' ), cart.id );
			} else {
				message = sprintf( __( 'Do you want to load the cart number #%s?', 'yith-point-of-sale-for-woocommerce' ), cart.id );
			}

			cancelText = __( 'No, keep the cart', 'yith-point-of-sale-for-woocommerce' );

			this.openModal( <Confirm message={message} confirmText={confirmText}
				cancelText={cancelText}
				onConfirm={() => {
					this.reloadCart( cart.id );
					this.closeModal()
				}}
				onCancel={this.closeModal}
			/> )
		}

		if ( actionName === 'remove' ) {
			message    = sprintf( __( 'Do you want to remove the cart number #%s?', 'yith-point-of-sale-for-woocommerce' ), cart.id );
			cancelText = __( 'No, keep the cart', 'yith-point-of-sale-for-woocommerce' );
			this.openModal( <Confirm message={message} confirmText={confirmText}
				cancelText={cancelText}
				onConfirm={() => {
					this.removeSavedCart( cart.id );
					this.closeModal()
				}}
				onCancel={this.closeModal}
			/> )
		}
	}

	//remove cart
	removeSavedCart = cart_id => {
		const { currentCartID } = this.state;
		const carts             = this._getCarts().filter( cart => cart.id !== cart_id );
		const currentCart       = carts.map( e => e.id ).indexOf( currentCartID );
		this.setState( { carts, currentCart } );
	}

	reloadCart = cart_id => {
		let { currentCart } = this.state;
		let carts           = this._getCarts();

		if ( !this.cartManager.isEmpty() ) {
			const message    = __( 'This cart was switched with the cart number', 'yith-point-of-sale-for-woocommerce' );
			const reasonNote = `${message} #${cart_id}`;
			this.cartManager.setSaveReasonNote( reasonNote );

			carts[ currentCart ] = this.cartManager.getCart();
		} else {
			carts = carts.filter( ( cart, index ) => ( index !== currentCart ) );
		}
		//change the current cart
		currentCart      = carts.map( e => e.id ).indexOf( cart_id );
		this.cartManager = new CartManager( carts[ currentCart ] );
		this.setState( { carts, currentCart, currentCartID: cart_id, showSavedCarts: false } );
	}

	editSavedCartNote = ( cart_id, note ) => {
		let carts         = this._getCarts();
		const cartIndex   = carts.map( e => e.id ).indexOf( cart_id );
		const cartManager = new CartManager( carts[ cartIndex ] );
		cartManager.setSaveReasonNote( note );
		carts[ cartIndex ] = cartManager.getCart();
		this.setState( { carts } );
	}

	saveCurrentCart = ( reasonNote ) => {
		let { currentCart } = this.state;

		this.cartManager.setSaveReasonNote( reasonNote );
		let carts            = this._getCarts();
		carts[ currentCart ] = this.cartManager.getCart();

		this.cartManager.emptyCart();
		let newCart = this.cartManager.getCart();

		if ( newCart.id === '' ) {
			newCart.id = CartManager.generateCartID();
		}

		carts.push( newCart );
		currentCart = carts.length - 1;

		this.setState( { carts, currentCart, currentCartID: newCart.id } );
		this.closeModal();
	}

	getSavedCarts = () => {
		const { carts, currentCartID } = this.state;
		const savedCarts               = carts.filter( ( cart ) => cart.id !== currentCartID );
		return savedCarts;
	}

	/** Coupons **/
	applyCouponModal = () => {
		if ( this.checkCapability( 'view_coupons' ) ) {
			const formattedTotal = formatCurrency( this.cartManager.getCartTotal() );
			const title          = __( 'Apply coupon to order total', 'yith-point-of-sale-for-woocommerce' ) +
								   `<span class='modal__title-price'>${formattedTotal}</span>`;

			this.openModal( <CartApplyCoupon formattedCartTotal={formattedTotal} addCoupon={this.addCoupon}
				getTestTotalWithCoupon={this.getTestTotalWithCoupon}/>, title, 'modal-close-space' )
		}
	};

	addCoupon = ( coupon ) => {
		this.cartManager.addCoupon( coupon );
		this._updateCurrentCart();
		this.closeModal();
	};

	removeCoupon = ( code ) => {
		this.cartManager.removeCoupon( code );
		this._updateCurrentCart();
	};

	/* Added by WisdmLabs */
	/** Points */
	redeemPointsModal = () => {
		if ( this.checkCapability( 'view_coupons' ) ) {
			const cartTotals = this.cartManager.totals();
			const customer   = this.cartManager.getCartCustomer();
			const title      = __( 'Redeem Points', 'yith-point-of-sale-for-woocommerce' ) +
								`<span class='modal__title-price'>${ customer.points }</span>`;
			this.openModal(
				<CartRedeemPoints
					customer={ customer }
					cartTotals={ cartTotals }
					redeemAndApplyPoints={ this.redeemAndApplyPoints } />,
				title,
				'modal-close-space'
			);
		}
	};

	editRedeemPoints = ( key = '' ) => {
		const currentPoints = this.cartManager.getFeeOrDiscount( key );
		let old_points      = parseInt( currentPoints?.reason ?? 0 );
		const cartTotals    = this.cartManager.totals();
		const customer      = this.cartManager.getCartCustomer();
		const title         = __( 'Redeem Points', 'yith-point-of-sale-for-woocommerce' ) +
							`<span class='modal__title-price'>${ customer.points + old_points }</span>`;
		this.openModal(
			<CartRedeemPoints
				currentPoints={ currentPoints }
				customer={ customer }
				cartTotals={ cartTotals }
				redeemAndApplyPoints={ this.redeemAndApplyPoints }
				onUndo={this.closeModal} />,
			title,
			'modal-close-space'
		);
	};

	redeemAndApplyPoints = discount => {

		if ( typeof discount.key !== 'undefined' ) {
			this.cartManager.editFeeOrDiscount( discount.key, discount );
		} else {
			this.cartManager.addFeeOrDiscount( discount );
		}

		const customer  = this.cartManager.getCartCustomer();
		customer.points = customer.points + discount.old_points - discount.points;
		this.cartManager.setCartCustomer( customer );
		this._updateCurrentCart();
		this.closeModal();
	}
	/* Added by WisdmLabs */

	editCartNoteModal = () => {
		const formattedTotal = formatCurrency( this.cartManager.getCartTotal() );
		const cartNote       = this.cartManager.getNote();
		const title          = __( 'Order total', 'yith-point-of-sale-for-woocommerce' ) + '<span class="modal__title-price">' + formattedTotal + '</span>';

		this.openModal( <CartAddNote saveCartNote={this.saveCartNote} currentNote={cartNote}
			cartTotal={formattedTotal}/>, title, 'modal-add-note modal-close-space' )
	};

	saveCartNote = ( note ) => {
		this.cartManager.setNote( note );

		this._updateCurrentCart();
		this.closeModal();
	};

	getTestTotalWithFee = ( fee ) => {
		return typeof fee !== 'undefined' ? this.cartManager.getTestTotalWithFee( fee ) : this.cartManager.getTotal( 'total' );
	};

	getTestTotalWithoutFee = ( fee ) => {
		return typeof fee !== 'undefined' ? this.cartManager.getTestTotalWithoutFee( fee ) : this.cartManager.getTotal( 'total' );
	};

	editFeeOrDiscount = ( key = '' ) => {
		const currentFeeOrDiscount = this.cartManager.getFeeOrDiscount( key );
		const formattedTotal       = formatCurrency( this.getTestTotalWithoutFee( currentFeeOrDiscount ) );
		const title                = __( 'Add fee or discount to order total', 'yith-point-of-sale-for-woocommerce' ) + '<span class="modal__title-price">' + formattedTotal + '</span>';
		this.openModal(
			<CartAddFeeOrDiscount saveFeeOrDiscount={this.saveFeeOrDiscount}
				currentFeeOrDiscount={currentFeeOrDiscount}
				onUndo={this.closeModal} getTestTotalWithFee={this.getTestTotalWithFee}/>, title, 'modal-close-space' )
	};

	saveFeeOrDiscount = ( feeOrDiscount ) => {
		if ( typeof feeOrDiscount.key !== 'undefined' ) {
			this.cartManager.editFeeOrDiscount( feeOrDiscount.key, feeOrDiscount );
		} else {
			this.cartManager.addFeeOrDiscount( feeOrDiscount );
		}

		this._updateCurrentCart();
		this.closeModal();
	};

	removeFeeOrDiscount = ( key ) => {
		/* Added by WisdmLabs */
		let discountPoints = this.cartManager.getCoupon( key );
		let pointsToAdd    = parseInt( discountPoints.description );
		let customer       = this.cartManager.getCartCustomer();
		customer.points    = customer.points + pointsToAdd;
		this.cartManager.setCartCustomer( customer );
		/* Added by WisdmLabs */
		if ( this.cartManager.removeFeeOrDiscount( key ) ) {
			this._updateCurrentCart();
		}
	};

	editCustomer = ( customer = '' ) => {
		this.setState( { isEditingCustomer: true } );
	};

	editCustomerShipping = () => {
		this.setState( { isEditingCustomerShipping: true } );
	};

	updateCustomer = ( customer, close = false ) => {
		this.cartManager.setCartCustomer( customer );
		this._updateCurrentCart();
		if ( close ) {
			this.closeModal();
			this.setState( { isEditingCustomer: false } );
		}
	};

	setAction = ( action ) => {
		if ( 'add-product' === action ) {
			const title = __( 'Add a new product', 'yith-point-of-sale-for-woocommerce' );
			this.openModal(
				<ProductAddNewForm addCartItemProduct={this.addCartItemProduct}
					close={this.closeModal}/>, title, '', true )
		}

		if ( 'scan-product' === action ) {
			const { scannerActive } = this.state;
			this.setState( { scannerActive: !scannerActive } );
		}

		if ( 'customer' === action ) {
			this.editCustomer();
		}

		if ( 'address' === action ) {
			this.editCustomerShipping();
		}

		if ( 'cart' === action ) {
			this.showCurrentCart();
		}

		if ( 'saved-carts' === action ) {
			this.setState( { showSavedCarts: true } );
		}
	};

	payModal = () => {
		const formattedTotal = formatCurrency( this.cartManager.getCartTotal() );
		const title          = __( 'Split Payment', 'yith-point-of-sale-for-woocommerce' ) + '<span class="modal__title-price">' + formattedTotal + '</span>';
		this.openModal(
			<CartPayment total={this.cartManager.getCartTotal()} onUndo={this.closeModal}
				onPay={this.processOrder}/>, title, 'payment-modal modal-close-space' );
	};

	processOrder = ( { paymentMethods, change } ) => {

		if ( this.checkCapability( 'create_orders' ) ) {
			const orderPromise = this.cartManager.processOrder( { paymentMethods, change } );
			this.setState( { loadingLock: true } );
			orderPromise
				.then( ( order ) => {
					this.emptyCurrentCart();
					this.updateProductsFromCreatedOrder( order );
					this.openModal(
						<OrderDetails order={order}/>, '', 'modal-show-only-close-button'
					);
					doAction( ORDER_PROCESSED_AFTER_SHOWING_DETAILS_ACTION, order );
				} )
				.catch( ( error ) => {
					this.notice( sprintf( __( 'Error: %s', 'yith-point-of-sale-for-woocommerce' ), error.message ),
								 __( 'Fix your cart and try again', 'yith-point-of-sale-for-woocommerce' ) );
				} )
				.then( () => {
					this.setState( { loadingLock: false } );
				} );
		}
	};

	updateProductsFromCreatedOrder = ( order ) => {
		const { dispatch } = this.props;
		order.line_items.forEach( item => {
			const { product } = item;

			if ( product ) {
				dispatch( productUpdated( product ) );
			}
		} );
	}

	checkCapability = ( capability ) => {
		capability = 'yith_pos_' + capability;

		if ( !userCan( capability ) ) {
			this.notice( userCanError( capability ) );
			return false;
		}
		return true;
	}

	getTestTotalWithShipping = ( shipping ) => {
		return typeof shipping !== 'undefined' ? this.cartManager.getTestTotalWithShipping( shipping ) : this.cartManager.getTotal( 'total' );
	};

	getTestTotalWithoutShipping = ( shipping ) => {
		return typeof shipping !== 'undefined' ? this.cartManager.getTestTotalWithoutShipping( shipping ) : this.cartManager.getTotal( 'total' );
	};


	editShippingMethod = ( key = '' ) => {
		const currentShippingMethod = this.cartManager.getShippingMethod( key );
		const formattedTotal        = formatCurrency( this.getTestTotalWithoutShipping( currentShippingMethod ) );
		const title                 = __( 'Shipping', 'yith-point-of-sale-for-woocommerce' ) + '<span class="modal__title-price">' + formattedTotal + '</span>';
		this.openModal(
			<CartShipping onUndo={this.closeModal} onSave={this.saveShippingMethod}
				currentShippingMethod={currentShippingMethod}
				getTestTotalWithShipping={this.getTestTotalWithShipping}/>, title, 'shipping-modal modal-close-space' );
	};

	saveShippingMethod = ( shippingMethod ) => {
		if ( typeof shippingMethod.key !== 'undefined' ) {
			this.cartManager.editShippingMethod( shippingMethod.key, shippingMethod );
		} else {
			this.cartManager.addShippingMethod( shippingMethod );
		}

		this._updateCurrentCart();
		this.closeModal();
	};

	removeShippingMethod = ( key ) => {
		if ( this.cartManager.removeShippingMethod( key ) ) {
			this._updateCurrentCart();
		}
	};

	onViewGroupOrderStats = ( group ) => {
		const title = __( 'Profit of', 'yith-point-of-sale-for-woocommerce' ) + ' ' + group?.date;
		this.openModal(
			<OrdersReports orders={group?.items ?? []}/>,
			title,
			'daily-orders-reports-modal',
			true
		);
	};

	showRegisterProfit = () => {
		const title = __( "Today's profit", 'yith-point-of-sale-for-woocommerce' );
		this.openModal(
			<RegisterSessionReports registerManager={this.register}/>,
			title,
			'register-today-profit-modal',
			true
		);
	}

	showCloseRegister = () => {
		if ( yithPosSettings.register.closing_report_enabled === 'no' ) {
			this.register.closeRegister( '' );
			return;
		}

		const title = _x( 'Close Register', 'Title of Close Register modal', 'yith-point-of-sale-for-woocommerce' );
		this.openModal(
			<RegisterClose onUndo={this.closeModal}
				register={this.register}/>, title, 'register-close-modal', true );
	}

	downloadCashierCSV = () => {
		downloadCashierReports();
	}

	logout = () => {
		const message     = __( 'Are you sure you want to log out?', 'yith-point-of-sale-for-woocommerce' );
		const title       = __( 'Logout', 'yith-point-of-sale-for-woocommerce' );
		const confirmText = __( 'Yes', 'yith-point-of-sale-for-woocommerce' );
		const cancel      = __( 'Cancel', 'yith-point-of-sale-for-woocommerce' );
		this.openModal(
			<Confirm message={message} confirmText={confirmText} cancelText={cancel} onCancel={this.closeModal} onConfirm={this.logoutConfirmed}/>,
			title, '', false );
	}

	logoutConfirmed = () => {
		window.location.href = yithPosSettings.logoutUrl;
	}

	render() {
		const cartNote  = this.cartManager.getNote();
		const cartItems = this.cartManager.getCartItems();
		const totals    = this.cartManager.getTotals();
		const customer  = this.cartManager.getCartCustomer();

		const { showSavedCarts, loadingLock, scannerActive, isEditingCustomer, isEditingCustomerShipping } = this.state;

		let wrapperClasses = ['yith-pos-wrap'];
		if ( loadingLock ) {
			wrapperClasses.push( 'yith-pos--loading-lock' );
		}

		const productSectionProps = {
			addCartItem: this.addCartItemProductHandler,
			onAction   : this.setAction
		};

		const cartProps = {
			isCartEmpty         : this.cartManager.isEmpty(),
			savedCarts          : this.getSavedCarts(),
			removeCartItem      : this.removeCartItem,
			editCartItemQuantity: this.editCartItemQuantity,
			editCartItemNote    : this.editCartItemNote,
			editCartItemPrice   : this.editCartItemPrice,
			editCustomer        : this.editCustomer,
			customer            : this.cartManager.getCartCustomer(),
			resetCartItemPrice  : this.resetCartItemPrice,
			emptyCart           : this.emptyCurrentCartConfirm,
			editCartNote        : this.editCartNoteModal,
			applyCoupon         : this.applyCouponModal,
			editFeeOrDiscount   : this.editFeeOrDiscount,
			removeFeeOrDiscount : this.removeFeeOrDiscount,
			addShipping         : this.editShippingMethod,
			editShippingMethod  : this.editShippingMethod,
			removeShippingMethod: this.removeShippingMethod,
			removeCoupon        : this.removeCoupon,
			saveCart            : this.saveCartModal,
			savedCartAction     : this.savedCartAction,
			editSavedCartNote   : this.editSavedCartNote,
			onAction            : this.setAction,
			pay                 : this.payModal,
			/* Added by WisdmLabs */
			redeemPoints        : this.redeemPointsModal,
			editRedeemPoints    : this.editRedeemPoints
			/* Added by WisdmLabs */
		};

		const orderHistoryProps = {
			onViewGroupOrderStats: this.onViewGroupOrderStats
		};

		const posHeaderProps = {
			registerProfit: this.showRegisterProfit,
			openCashInHand: this.openCashInHand,
			closeRegister : this.showCloseRegister,
			downloadCSV   : this.downloadCashierCSV,
			logout        : this.logout
		};

		loggerStore.addLog( 'cart-coupons', 'Cart Coupons', this.cartManager.getCart().coupons );

		return (
			<div className={wrapperClasses.join( ' ' )}>
				<div className="yith-pos">
					<PosHeader register={this.register} {...posHeaderProps} />
					<div id="pos-shadow"/>
					<Routes>
						<Route path="/history" element={<OrderHistory {...orderHistoryProps}/>}/>
						<Route path="/" element={
							<Fragment>

								<ProductsSection scannerActive={scannerActive} {...productSectionProps}/>
								<Cart items={cartItems}
									note={cartNote}
									totals={totals}
									showSavedCarts={showSavedCarts}
									{...cartProps}
								/>
								{
									isEditingCustomer &&
									<CustomerController
										customer={customer}
										/* Added by WisdmLabs */
										cart={ this.cartManager }
										/* Added by WisdmLabs */
										onClose={() => this.setState( { isEditingCustomer: false } )}
										onChange={( _ ) => this.updateCustomer( _ )}
									/>
								}
								{
									isEditingCustomerShipping &&
									<CustomerShippingModal
										customer={customer}
										onClose={() => this.setState( { isEditingCustomerShipping: false } )}
										onSave={( _ ) => this.updateCustomer( _ )}
									/>
								}
							</Fragment>
						}/>
					</Routes>
					<ControlledModal ref={this.controlledModalElement}/>
				</div>
				{isLoggerEnabled() && <Logger/>}
			</div>
		);
	}
}

export default connect()( App );
