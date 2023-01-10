import SimpleObject   from './simple-object';
import { absInt }     from '../numbers';
import { taxEnabled } from '../taxes';

const receiptData = yithPosSettings.receipt ? { ...yithPosSettings.receipt } : {};

class Receipt extends SimpleObject {

	type = 'receipt';

	/** ------------------------------------------
	 * Getters
	 */
	getName = () => {
		return this.getProp( 'name', '' );
	};

	getNubOfCopies = () => {
		return absInt( this.getProp( 'num_of_copies', 1 ) );
	};

	getWidth = () => {
		return absInt( this.getProp( 'width', false ) );
	};

	getLogo = () => {
		return this.getProp( 'logo', '' );
	};

	getSkuLabel = () => {
		return this.getProp( 'sku_label', '' );
	};

	getVatLabel = () => {
		return this.getProp( 'vat_label', '' );
	};

	getOrderDateLabel = () => {
		return this.getProp( 'order_date_label', '' );
	};

	getOrderNumberLabel = () => {
		return this.getProp( 'order_number_label', '' );
	};

	getOrderCustomerLabel = () => {
		return this.getProp( 'order_customer_label', '' );
	};

	getOrderRegisterLabel = () => {
		return this.getProp( 'order_register_label', '' );
	};

	getCashierLabel = () => {
		return this.getProp( 'cashier_label', '' );
	};

	getShippingLabel = () => {
		return this.getProp( 'shipping_label', '' );
	};

	getReceiptFooter = () => {
		return this.getProp( 'receipt_footer', '' );
	};

	getOrder = () => {
		return this.getProp( 'order' );
	}

	/** ------------------------------------------
	 * Conditionals
	 */
	isEnabled = () => !!receiptData;

	isGiftReceiptEnabled = () => {
		return 'yes' === this.getProp( 'enable_gift_receipt', 'no' );
	};

	showSku = () => {
		return 'yes' === this.getProp( 'show_sku', 'no' );
	};

	showTaxDetails = () => {
		return 'yes' === this.getProp( 'show_tax_details', 'no' );
	};

	showPricesIncludingTax = () => {
		return 'yes' === this.getProp( 'show_prices_including_tax', 'no' );
	};

	showItemizedTax = () => {
		return 'itemized' === this.getProp( 'show_taxes', 'total' );
	};

	showStoreName = () => {
		return 'yes' === this.getProp( 'show_store_name', 'no' );
	};

	showVat = () => {
		return 'yes' === this.getProp( 'show_vat', 'no' );
	};

	showAddress = () => {
		return 'yes' === this.getProp( 'show_address', 'no' );
	};

	showContactInfo = () => {
		return 'yes' === this.getProp( 'show_contact_info', 'no' );
	};

	showPhone = () => {
		return this.showContactInfo() && 'yes' === this.getProp( 'show_phone', 'no' );
	};

	showEmail = () => {
		return this.showContactInfo() && 'yes' === this.getProp( 'show_email', 'no' );
	};

	showFax = () => {
		return this.showContactInfo() && 'yes' === this.getProp( 'show_fax', 'no' );
	};

	showWebsite = () => {
		return this.showContactInfo() && 'yes' === this.getProp( 'show_website', 'no' );
	};

	showSocialInfo = () => {
		return 'yes' === this.getProp( 'show_social_info', 'no' );
	};

	showFacebook = () => {
		return this.showSocialInfo() && 'yes' === this.getProp( 'show_facebook', 'no' );
	};

	showTwitter = () => {
		return this.showSocialInfo() && 'yes' === this.getProp( 'show_twitter', 'no' );
	};

	showInstagram = () => {
		return this.showSocialInfo() && 'yes' === this.getProp( 'show_instagram', 'no' );
	};

	showYoutube = () => {
		return this.showSocialInfo() && 'yes' === this.getProp( 'show_youtube', 'no' );
	};

	showOrderDate = () => {
		return 'yes' === this.getProp( 'show_order_date', 'no' );
	};

	showOrderNumber = () => {
		return 'yes' === this.getProp( 'show_order_number', 'no' );
	};

	showOrderCustomer = () => {
		return 'yes' === this.getProp( 'show_order_customer', 'no' );
	};

	showOrderRegister = () => {
		return 'yes' === this.getProp( 'show_order_register', 'no' );
	};

	showCashier = () => {
		return 'yes' === this.getProp( 'show_cashier', 'no' );
	};

	showShipping = () => {
		return 'yes' === this.getProp( 'show_shipping', 'no' );
	};


	/** ------------------------------------------
	 * Setters
	 */
	setOrder = ( order ) => {
		this.setProp( 'order', order );
	}
}

export const getReceipt = () => {
	return new Receipt( receiptData );
}

const globalReceipt = getReceipt();

export function isGiftReceiptEnabled() {
	return globalReceipt.isGiftReceiptEnabled();
}