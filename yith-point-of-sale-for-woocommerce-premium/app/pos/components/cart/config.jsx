import { __ } from '@wordpress/i18n';

export const cartActions = [
	{
		id            : 'empty-cart',
		label         : __( 'Empty Cart', 'yith-point-of-sale-for-woocommerce' ),
		onClickHandler: 'emptyCart'
	},
	{
		id            : 'add-note',
		label         : __( 'Add note', 'yith-point-of-sale-for-woocommerce' ),
		altLabel      : __( 'Edit note', 'yith-point-of-sale-for-woocommerce' ),
		altConditionCb: 'hasNote',
		icon          : 'yith-pos-icon-item-note',
		onClickHandler: 'editCartNote'
	},
	{
		id            : 'add-fee-or-discount',
		label         : __( 'Add fee or discount', 'yith-point-of-sale-for-woocommerce' ),
		icon          : 'yith-pos-icon-add',
		onClickHandler: 'editFeeOrDiscount'
	},
	{
		id            : 'apply-coupon',
		label         : __( 'Apply coupon', 'yith-point-of-sale-for-woocommerce' ),
		icon          : 'yith-pos-icon-gift-card',
		onClickHandler: 'applyCoupon'
	},
	// Added by WisdmLabs
	{
		id            : 'redeem-points',
		label         : __( 'Redeem Points', 'yith-point-of-sale-for-woocommerce' ),
		icon          : 'yith-pos-icon-coin',
		onClickHandler: 'redeemPoints'
	},
	// Added by WisdmLabs
	{
		id            : 'add-shipping',
		label         : __( 'Shipping', 'yith-point-of-sale-for-woocommerce' ),
		icon          : 'yith-pos-icon-shipping',
		onClickHandler: 'addShipping'
	},
	{
		id            : 'suspend-and-save-cart',
		label         : __( 'Suspend & save cart', 'yith-point-of-sale-for-woocommerce' ),
		icon          : 'yith-pos-icon-saved-cart',
		onClickHandler: 'saveCart'
	},
	{
		id            : 'pay',
		label         : __( 'Pay', 'yith-point-of-sale-for-woocommerce' ),
		icon          : false,
		onClickHandler: 'pay'
	}
];

export const i18n_cart_label = {
	addNote              : __( 'Add a note to this order', 'yith-point-of-sale-for-woocommerce' ),
	addNewPayment        : __( 'Add another payment option', 'yith-point-of-sale-for-woocommerce' ),
	address              : __( 'Address', 'yith-point-of-sale-for-woocommerce' ),
	amountLabel          : __( 'Amount', 'yith-point-of-sale-for-woocommerce' ),
	amountPaying         : __( 'Amount paying', 'yith-point-of-sale-for-woocommerce' ),
	amountToPayLabel     : __( 'Amount to pay', 'yith-point-of-sale-for-woocommerce' ),
	amountTypeLabel      : __( 'Amount type', 'yith-point-of-sale-for-woocommerce' ),
	applyCouponButton    : __( 'Apply coupon', 'yith-point-of-sale-for-woocommerce' ),
	backLabel            : __( 'Back', 'yith-point-of-sale-for-woocommerce' ),
	balance              : __( 'Balance', 'yith-point-of-sale-for-woocommerce' ),
	byPrefix             : __( 'By', 'yith-point-of-sale-for-woocommerce' ),
	cart                 : __( 'Cart ', 'yith-point-of-sale-for-woocommerce' ),
	change               : __( 'Change', 'yith-point-of-sale-for-woocommerce' ),
	changePrice          : __( 'Change price per unit', 'yith-point-of-sale-for-woocommerce' ),
	customer             : __( 'Customer ', 'yith-point-of-sale-for-woocommerce' ),
	customerGuest        : __( 'Guest Customer ', 'yith-point-of-sale-for-woocommerce' ),
	discount             : __( 'Discount', 'yith-point-of-sale-for-woocommerce' ),
	editNote             : __( 'Edit note', 'yith-point-of-sale-for-woocommerce' ),
	enterCouponCode      : __( 'Enter coupon code', 'yith-point-of-sale-for-woocommerce' ),
	fee                  : __( 'Fee', 'yith-point-of-sale-for-woocommerce' ),
	fixed                : __( 'Fixed', 'yith-point-of-sale-for-woocommerce' ),
	labelPresets         : __( 'Popular fees', 'yith-point-of-sale-for-woocommerce' ),
	labelPaymentPresets  : __( 'Popular tendered', 'yith-point-of-sale-for-woocommerce' ),
	load                 : __( 'load', 'yith-point-of-sale-for-woocommerce' ),
	paymentOption        : __( 'Payment option', 'yith-point-of-sale-for-woocommerce' ),
	pendingPayment       : __( 'Pending payment', 'yith-point-of-sale-for-woocommerce' ),
	productSingular      : __( 'product', 'yith-point-of-sale-for-woocommerce' ),
	productPlural        : __( 'products', 'yith-point-of-sale-for-woocommerce' ),
	percentage           : __( 'Percentage', 'yith-point-of-sale-for-woocommerce' ),
	reasonLabel          : __( 'Reason (optional)', 'yith-point-of-sale-for-woocommerce' ),
	reasonCartDescription: __( 'Add a reason or note (optional)', 'yith-point-of-sale-for-woocommerce' ),
	reasonCartSaveSubmit : __( 'Suspend & save cart', 'yith-point-of-sale-for-woocommerce' ),
	saveNote             : __( 'Save note', 'yith-point-of-sale-for-woocommerce' ),
	shipping             : __( 'Shipping', 'yith-point-of-sale-for-woocommerce' ),
	shippingMethod       : __( 'Shipping Method', 'yith-point-of-sale-for-woocommerce' ),
	submitLabel          : __( 'Update Total', 'yith-point-of-sale-for-woocommerce' ),
	submitPaymentLabel   : __( 'Pay', 'yith-point-of-sale-for-woocommerce' ),
	submitShippingLabel  : __( 'Save Shipping', 'yith-point-of-sale-for-woocommerce' ),
	totalPayable         : __( 'Total due', 'yith-point-of-sale-for-woocommerce' ),
	totalPaying          : __( 'Total paying', 'yith-point-of-sale-for-woocommerce' ),
	typeLabel            : __( 'Add fee or discount', 'yith-point-of-sale-for-woocommerce' ),
	// Added by WisdmLabs
	points               : __( 'Points', 'yith-point-of-sale-for-woocommerce' ),
	redeemPointsButton   : __( 'Redeem Points', 'yith-point-of-sale-for-woocommerce' ),
	enterRedeemPoints    : __( 'Enter Points to Redeem', 'yith-point-of-sale-for-woocommerce' ),
	// Added by WisdmLabs
};

export const selectFeeOptions = [
	{ key: 'discount', label: i18n_cart_label.discount, icon: 'trend-down' },
	{ key: 'fee', label: i18n_cart_label.fee, icon: 'trending-up' }
];

export const selectTypeAmountOptions = [
	{ key: 'fixed', label: i18n_cart_label.fixed, iconText: yithPosSettings.wc.currency.symbol },
	{ key: 'percentage', label: i18n_cart_label.percentage, iconText: '%' }
];

export const cartButtons = [
	{ key: 'cart', label: i18n_cart_label.cart, icon: 'cart', active: true },
	{ key: 'customer', label: i18n_cart_label.customer, icon: 'customer', active: false },
	{ key: 'address', label: i18n_cart_label.address, icon: 'location', active: false },
	{ key: 'saved-carts', label: '', icon: 'saved-cart', active: false }
];
