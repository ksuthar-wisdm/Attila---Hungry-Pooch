import { __ } from '@wordpress/i18n';

export const i18n_product_label = {
	productName              : __( 'Product name: ', 'yith-point-of-sale-for-woocommerce' ),
	productCategory          : __( 'Product category:', 'yith-point-of-sale-for-woocommerce' ),
	sku                      : __( 'SKU', 'yith-point-of-sale-for-woocommerce' ),
	taxStatus                : __( 'Tax Status:', 'yith-point-of-sale-for-woocommerce' ),
	taxClass                 : __( 'Tax Class:', 'yith-point-of-sale-for-woocommerce' ),
	defaultPrice             : __( 'Regular price:', 'yith-point-of-sale-for-woocommerce' ),
	manageStock              : __( 'Stock:', 'yith-point-of-sale-for-woocommerce' ),
	quantityInStock          : __( 'Quantity in stock:', 'yith-point-of-sale-for-woocommerce' ),
	syncWCProduct            : __( 'Sync with WooCommerce:', 'yith-point-of-sale-for-woocommerce' ),
	enabled                  : __( 'Enabled', 'yith-point-of-sale-for-woocommerce' ),
	disabled                 : __( 'Disabled', 'yith-point-of-sale-for-woocommerce' ),
	createProduct            : __( 'Create product', 'yith-point-of-sale-for-woocommerce' ),
	taxable                  : __( 'Taxable', 'yith-point-of-sale-for-woocommerce' ),
	shippingOnly             : __( 'Shipping only', 'yith-point-of-sale-for-woocommerce' ),
	none                     : __( 'None', 'yith-point-of-sale-for-woocommerce' ),
	insertChar               : __( 'Please enter 3 or more characters', 'yith-point-of-sale-for-woocommerce' ),
	noResult                 : __( 'No results found.', 'yith-point-of-sale-for-woocommerce' ),
	addToCart                : __( 'add to cart', 'yith-point-of-sale-for-woocommerce' ),
	inclusive                : __( 'Inclusive', 'yith-point-of-sale-for-woocommerce' ),
	exclusive                : __( 'Exclusive', 'yith-point-of-sale-for-woocommerce' ),
	noOptionsMessage         : __( 'No Category found.', 'yith-point-of-sale-for-woocommerce' ),
	invalidSKU               : __( 'Invalid or duplicated SKU.', 'yith-point-of-sale-for-woocommerce' ),
	standard                 : __( 'Standard', 'yith-point-of-sale-for-woocommerce' ),
	searchCategoryPlaceholder: __( 'Search a category', 'yith-point-of-sale-for-woocommerce' ),
	required                 : __( 'This field is required', 'yith-point-of-sale-for-woocommerce' )
};

export const enabledSelectOptions = [
	{ key: 'enabled', label: i18n_product_label.enabled },
	{ key: 'disabled', label: i18n_product_label.disabled }
];

export const taxSelectOptions = [
	{ key: 'taxable', label: i18n_product_label.taxable },
	{ key: 'shipping', label: i18n_product_label.shippingOnly },
	{ key: 'none', label: i18n_product_label.none }
];
