/** yithPosSettings */
import { arraySum, floatSum, formatCurrency, formatPriceRange, formatSalePrice, roundPrice, roundPriceWithBetterPrecision } from '../numbers';
import { mapMap, reverseOrderedMap }                                                                                        from '../utils';
import { getObjectMetaData }                                                                                                from '../objects';
import { sprintf }                                                                                                          from '@wordpress/i18n';


export function taxEnabled() {
    return !!yithPosSettings.tax.enabled;
}

export function priceIncludesTax() {
    return !!yithPosSettings.tax.priceIncludesTax;
}

export function showPriceIncludingTax() {
    return !!yithPosSettings.tax.showPriceIncludingTax;
}

export function showPriceIncludingTaxInShop() {
    return !!yithPosSettings.tax.showPriceIncludingTaxInShop;
}

export function showTaxRow() {
    return taxEnabled() && !showPriceIncludingTax();
}

/**
 *
 * @param {Object} product
 * @param {Object} options
 * @returns {Number}
 */
export function getProductPriceToDisplay( product, options = {} ) {
    const defaults = {
        price                : product.price,
        priceIncludesTax     : priceIncludesTax(),
        showPriceIncludingTax: showPriceIncludingTax()
    };
    options        = Object.assign( {}, defaults, options );
    let price      = parseFloat( options.price );
    if ( taxEnabled() && product.tax_status === 'taxable' && ( options.showPriceIncludingTax !== options.priceIncludesTax ) ) {
        const taxRates = getTaxRates( product.tax_class );
        const taxes    = arraySum( calcTax( price, taxRates, options.priceIncludesTax ) );

        if ( options.priceIncludesTax ) {
            price = price - taxes;
        } else {
            price = price + taxes;
        }
    }
    return price;
}

export function getProductPriceToDisplayInShop( product, options = {} ) {
    const defaults = {
        showPriceIncludingTax: showPriceIncludingTaxInShop()
    };
    options        = Object.assign( {}, defaults, options );
    return getProductPriceToDisplay( product, options );
}

export function getProductPriceHTMLToDisplayInShop( product ) {
    let price = '';
    if ( product.type !== 'variable' &&
         product.on_sale && product.regular_price && product.sale_price &&
         product.price !== product.regular_price ) {
        price = formatSalePrice(
            getProductPriceToDisplayInShop( product, { price: product.regular_price } ),
            getProductPriceToDisplayInShop( product )
        );
    } else {
        price = formatCurrency( getProductPriceToDisplayInShop( product ) );
    }
    return price;
}

export function getOrderItemProductSinglePriceToDisplay( orderItem ) {
    return getOrderItemProductSubtotalPriceToDisplay( orderItem ) / orderItem.quantity;
}

export function getOrderItemProductSubtotalPriceToDisplay( orderItem, priceInclTax ) {
    priceInclTax = typeof priceInclTax !== 'undefined' ? !!priceInclTax : !showTaxRow();
    return taxEnabled() && priceInclTax
           ? floatSum( orderItem.subtotal, orderItem.subtotal_tax )
           : parseFloat( orderItem.subtotal );
}

export function getOrderShippingLineTotalPriceToDisplay( shippingLine, priceInclTax ) {
    priceInclTax = typeof priceInclTax !== 'undefined' ? !!priceInclTax : !showTaxRow();
    return taxEnabled() && priceInclTax
           ? floatSum( shippingLine.total, shippingLine.total_tax )
           : parseFloat( shippingLine.total );
}

export function getOrderCouponDiscountPriceToDisplay( couponLine, priceInclTax ) {
    priceInclTax = typeof priceInclTax !== 'undefined' ? !!priceInclTax : !showTaxRow();
    return taxEnabled() && priceInclTax
           ? floatSum( couponLine.discount, couponLine.discount_tax )
           : parseFloat( couponLine.discount );
}

export function getTaxRates( taxClass = '' ) {
    if ( !taxEnabled() || !yithPosSettings.tax.classesAndRates || !taxClass in yithPosSettings.tax.classesAndRates ) {
        return [];
    }
    return yithPosSettings.tax.classesAndRates[ taxClass ];
}

export function setCartItemTaxRates( item ) {
    /**
     * TODO: check if useful otherwise remove it
     * it could be useful only if we should allow editing taxRates for each cart item
     * otherwise it could be removed
     */
    if ( 'product' === item.type && item.product ) {
        if ( taxEnabled() && 'taxable' === item.product.tax_status ) {
            item.taxRates = getTaxRates( item.product.tax_class );
        } else {
            item.taxRates = [];
        }
    }
    return item;
}

export function calcTax( price, rates, _priceIncludesTax ) {
    if ( typeof _priceIncludesTax === 'undefined' ) {
        _priceIncludesTax = priceIncludesTax();
    }
    let taxes;
    if ( _priceIncludesTax ) {
        taxes = calcInclusiveTax( price, rates );
    } else {
        taxes = calcExclusiveTax( price, rates );
    }

    return taxes;
}

export function calcInclusiveTax( price, rates ) {
    let tax = 0, taxes = new Map(), compoundRates = new Map(), regularRates = new Map();
    if ( rates && Object.values( rates ).length ) {
        price = parseFloat( price );
        rates = new Map( Object.entries( rates ) );

        rates.forEach( ( value, key, map ) => {
            taxes.set( key, 0 );
            const rate = value;
            if ( 'yes' === rate.compound ) {
                compoundRates.set( key, rate );
            } else {
                regularRates.set( key, rate );
            }
        } );

        compoundRates = reverseOrderedMap( compoundRates );

        let nonCompoundPrice = price;

        compoundRates.forEach( ( value, key, map ) => {
            const compoundRate = parseFloat( value.rate );
            const taxAmount    = nonCompoundPrice - ( nonCompoundPrice / ( 1 + ( compoundRate / 100 ) ) );
            tax += taxAmount;
            taxes.set( key, taxes.get( key ) + taxAmount );
            nonCompoundPrice -= taxAmount;
        } );

        const regularRatesSum = Object.values( Object.fromEntries( regularRates.entries() ) ).reduce( ( acc, rate ) => {
            return acc + rate.rate
        }, 0 );
        const regularTaxRate  = 1 + ( regularRatesSum / 100 );

        regularRates.forEach( ( value, key, map ) => {
            const regularRate = parseFloat( value.rate );
            const theRate     = ( regularRate / 100 ) / regularTaxRate;
            const netPrice    = price - ( theRate * nonCompoundPrice );
            const taxAmount   = price - netPrice;
            taxes.set( key, taxes.get( key ) + taxAmount );
            tax += taxAmount;
        } );

        taxes = mapMap( taxes, roundPriceWithBetterPrecision );
    }

    return taxes;
}

export function calcExclusiveTax( price, rates ) {
    let tax = 0, taxes = new Map(), compoundRates = new Map(), regularRates = new Map();
    if ( rates && Object.values( rates ).length ) {
        price = parseFloat( price );
        rates = new Map( Object.entries( rates ) );

        rates.forEach( ( value, key, map ) => {
            taxes.set( key, 0 );
            const rate = value;
            if ( 'yes' === rate.compound ) {
                compoundRates.set( key, rate );
            } else {
                regularRates.set( key, rate );
            }
        } );

        regularRates.forEach( ( value, key, map ) => {
            const regularRate = parseFloat( value.rate );
            const taxAmount   = price * regularRate / 100;
            taxes.set( key, taxes.get( key ) + taxAmount );
            tax += taxAmount;
        } );

        let preCompoundTotal = tax;

        compoundRates.forEach( ( value, key, map ) => {
            const compoundRate = roundPrice( value.rate );
            const priceIncTax  = price + preCompoundTotal;
            const taxAmount    = priceIncTax * compoundRate / 100;
            tax += taxAmount;
            taxes.set( key, taxes.get( key ) + taxAmount );

            preCompoundTotal = tax;
        } );

        taxes = mapMap( taxes, roundPriceWithBetterPrecision );
    }

    return taxes;
}

export function getTaxRoundingMode() {
    return priceIncludesTax() ? 'half-down' : 'half-up';
}