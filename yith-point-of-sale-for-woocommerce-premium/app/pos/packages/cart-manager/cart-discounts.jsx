import { sprintf }          from '@wordpress/i18n';
import _                    from 'lodash';
import { couponErrors }     from './config';
import { priceIncludesTax } from '../taxes';
import {
    absInt,
    addNumberPrecision, arraySum,
    formatCurrency,
    removeNumberPrecisionDeep, roundIntPrice, removeNumberPrecision
} from '../numbers';
import { CartCouponError }  from '../errors';
import { objectMap }        from '../utils';
import { applyFilters } from '@wordpress/hooks';

const COUPON_CUSTOM_DISCOUNT_AMOUNT_FILTER = 'yith_pos_coupon_custom_discount_amount';
const COUPON_CUSTOM_DISCOUNTS_ARRAY_FILTER = 'yith_pos_coupon_custom_discounts_array';
const IS_PRODUCT_COUPON_FILTER             = 'yith_pos_is_product_coupon';
const IS_CART_COUPON_FILTER                = 'yith_pos_is_cart_coupon';
const COUPON_IS_VALID_FOR_PRODUCT_FILTER   = 'yith_pos_coupon_is_valid_for_product';
const COUPON_IS_VALID_FOR_CART_FILTER      = 'yith_pos_coupon_is_valid_for_cart';

export class CartDiscounts {
    /**
     * @var {CartManager}
     */
    #cartManager;
    #items = [];

    #discounts      = {};
    #invalidCoupons = {};

    /**
     * @param {CartManager} cartManager
     */
    constructor( cartManager ) {
        this.#cartManager = cartManager;
        this.#items       = cartManager.getCartItems();
        this.#items.sort( CartDiscounts.sortByPrice );
        this.#discounts = {};
    }

    static sortByPrice( a, b ) {
        if ( a.linePrice === b.linePrice ) {
            return 0;
        }

        return a.linePrice < b.linePrice ? 1 : -1;
    }

    static calcDiscountsSequentially() {
        return yithPosSettings.wc.calcDiscountsSequentially;
    }

    static getProductCategories( product ) {
        let categories = product.categories || [];

        if ( product.type === 'variation' && product.parent_categories ) {
            categories = product.parent_categories;
        }
        return categories;
    }

    _getZeroDiscountItems = () => {
        const reduce = ( acc, item ) => {
            acc[ item.cartItemKey ] = 0;
            return acc;
        };

        return this.#items.reduce( reduce, {} );
    };

    getCartSubtotal = () => {
        let subTotal = this.#cartManager.getTotal( 'subtotal' );
        if ( priceIncludesTax() ) {
            subTotal += this.#cartManager.getTotal( 'subtotalTax' );
        }
        return subTotal;
    };

    getItems = () => {
        return _.cloneDeep( this.#items );
    };

    getDiscounts = ( inCents = false ) => {
        const discounts = _.cloneDeep( this.#discounts );
        return inCents ? discounts : removeNumberPrecisionDeep( discounts );
    };

    getDiscountsByItem = ( inCents = false ) => {
        let itemDiscounts = this._getZeroDiscountItems();

        _.each( this.getDiscounts( true ), ( couponDiscounts, couponCode ) => {
            _.each( couponDiscounts, ( couponDiscount, cartItemKey ) => {
                itemDiscounts[ cartItemKey ] += couponDiscount;
            } );
        } );

        return inCents ? itemDiscounts : removeNumberPrecisionDeep( itemDiscounts );
    };

    getDiscount             = ( item, inCents = false ) => {
        const discountsByItem = this.getDiscountsByItem( inCents );
        return item.cartItemKey in discountsByItem ? discountsByItem[ item.cartItemKey ] : 0;
    };
    getItemLinePriceInCents = ( item ) => {
        return item.linePrice;
    };

    getDiscountedPriceInCents = ( item ) => {
        return Math.max( 0, roundIntPrice( this.getItemLinePriceInCents( item ) - this.getDiscount( item, true ) ) );
    };

    getItemsToApplyCoupon = ( coupon ) => {
        return this.#items.filter( ( item ) => {
            return !( this.getDiscountedPriceInCents( item ) === 0 || ( !this.isCouponValidForProduct( coupon, item.product ) && !this.isCouponValidForCart( coupon ) ) );
        } );
    };

    getDiscountsByCoupon = ( inCents = false ) => {
        const discounts         = this.getDiscounts( true );
        const discountsByCoupon = objectMap( discounts, arraySum );

        return inCents ? discountsByCoupon : removeNumberPrecisionDeep( inCents );
    };

    getInvalidCoupons = () => {
        return _.cloneDeep( this.#invalidCoupons );
    };

    applyCoupons = ( coupons ) => {
        coupons.forEach( ( coupon ) => {
            this.applyCoupon( coupon );
        } );
    };

    applyCoupon = ( coupon ) => {
        let valid = this.isCouponValid( coupon );

        if ( valid !== true ) {
            coupon.error = valid.message;
        }

        if ( valid === true ) {

            if ( !( coupon.code in this.#discounts ) ) {
                this.#discounts[ coupon.code ] = this._getZeroDiscountItems();
            }

            const itemsToApply = this.getItemsToApplyCoupon( coupon );

            switch ( coupon.discount_type ) {
                case 'percent':
                    this.applyCouponPercent( coupon, itemsToApply );
                    break;
                case 'fixed_product':
                    this.applyCouponFixedProduct( coupon, itemsToApply );
                    break;
                case 'fixed_cart':
                    this.applyCouponFixedCart( coupon, itemsToApply );
                    break;
                default:
                    this.applyCouponCustom( coupon, itemsToApply );
                    break;
            }
        } else {
            this.#invalidCoupons[ coupon.code ] = coupon;
        }
    };

    applyCouponPercent = ( coupon, items ) => {
        const amount           = roundIntPrice( coupon.amount );
        let totalDiscount      = 0;
        let cartTotal          = 0;
        let limitUsageQuantity = coupon.limit_usage_to_x_items ? coupon.limit_usage_to_x_items : 0;
        let appliedCount       = 0;
        let applyQuantity      = 0;

        items.forEach( item => {
            const discountedPrice = this.getDiscountedPriceInCents( item );
            let priceToDiscount   = CartDiscounts.calcDiscountsSequentially() ? discountedPrice : this.getItemLinePriceInCents( item );


            applyQuantity = limitUsageQuantity && ( limitUsageQuantity - appliedCount < item.qty ) ?
                            limitUsageQuantity - appliedCount :
                            item.qty;
            applyQuantity = Math.max( 0, applyQuantity );

            priceToDiscount = ( priceToDiscount / item.qty ) * applyQuantity;
            let discount    = Math.floor( priceToDiscount * amount / 100 );

            discount = Math.min( discountedPrice, discount );
            cartTotal += priceToDiscount;
            totalDiscount += discount;
            appliedCount += applyQuantity;

            this.#discounts[ coupon.code ][ item.cartItemKey ] += discount;
        } );

        const cartTotalDiscount = roundIntPrice( cartTotal * amount / 100 );

        if ( totalDiscount < cartTotalDiscount ) {
            totalDiscount += this.applyCouponRemainder( coupon, items, cartTotalDiscount - totalDiscount );
        }


        return totalDiscount;
    };

    applyCouponFixedCart = ( coupon, items, amount = false ) => {
        amount            = amount !== false ? amount : addNumberPrecision( coupon.amount );
        let totalDiscount = 0;

        const itemCount = items.reduce( ( acc, item ) => {
            return acc + parseInt( item.qty );
        }, 0 );

        if ( amount && itemCount ) {
            const perItemDiscount = absInt( amount / itemCount ); // round it down to the nearest cent.

            if ( perItemDiscount > 0 ) {
                totalDiscount = this.applyCouponFixedProduct( coupon, items, perItemDiscount );

                if ( totalDiscount > 0 && totalDiscount < amount ) {
                    totalDiscount += this.applyCouponFixedCart( coupon, items, amount - totalDiscount );
                }
            } else if ( amount > 0 ) {
                totalDiscount += this.applyCouponRemainder( coupon, items, amount );
            }
        }

        return totalDiscount;
    };

    applyCouponFixedProduct = ( coupon, items, amount = false ) => {
        amount                 = amount !== false ? amount : addNumberPrecision( coupon.amount );
        let totalDiscount      = 0;
        let limitUsageQuantity = coupon.limit_usage_to_x_items ? coupon.limit_usage_to_x_items : 0;
        let appliedCount       = 0;
        let applyQuantity      = 0;

        items.forEach( item => {
            const discountedPrice = this.getDiscountedPriceInCents( item );
            let discount          = amount * item.qty;

            if ( limitUsageQuantity ) {
                applyQuantity = limitUsageQuantity - appliedCount < item.qty ?
                                limitUsageQuantity - appliedCount :
                                item.qty;
                applyQuantity = Math.max( 0, applyQuantity );
                discount      = Math.min( amount, this.getItemLinePriceInCents( item ) / item.qty ) * applyQuantity;
            } else {
                applyQuantity = item.qty;
                discount      = amount * applyQuantity;
            }

            discount = Math.min( discountedPrice, discount );

            totalDiscount += discount;
            appliedCount += applyQuantity;

            this.#discounts[ coupon.code ][ item.cartItemKey ] += discount;
        } );

        return totalDiscount;
    };

    applyCouponRemainder = ( coupon, items, amount = false ) => {
        amount            = amount !== false ? amount : addNumberPrecision( coupon.amount );
        let totalDiscount = 0;

        items_loop:
            for ( let j in items ) {
                const item = items[ j ];
                for ( let i = 0; i < item.qty; i++ ) {
                    const discountedPrice = this.getDiscountedPriceInCents( item );
                    let priceToDiscount   = CartDiscounts.calcDiscountsSequentially() ? discountedPrice : this.getItemLinePriceInCents( item );
                    let discount          = Math.min( roundIntPrice( priceToDiscount ), 1 );

                    totalDiscount += discount;
                    this.#discounts[ coupon.code ][ item.cartItemKey ] += discount;

                    totalDiscount                                      = roundIntPrice( totalDiscount );
                    this.#discounts[ coupon.code ][ item.cartItemKey ] = roundIntPrice( this.#discounts[ coupon.code ][ item.cartItemKey ] );

                    if ( totalDiscount >= amount ) {
                        break items_loop;
                    }
                }
                if ( totalDiscount >= amount ) {
                    break;
                }
            }

        return totalDiscount;
    };

    applyCouponCustom = ( coupon, items ) => {
        let totalDiscount      = 0;
        let limitUsageQuantity = coupon.limit_usage_to_x_items ? coupon.limit_usage_to_x_items : 0;
        let appliedCount       = 0;
        
        items.forEach( item => {
            const discountedPrice       = this.getDiscountedPriceInCents( item );
            let priceToDiscount         = CartDiscounts.calcDiscountsSequentially() ? discountedPrice : this.getItemLinePriceInCents( item );
            priceToDiscount             = removeNumberPrecision( priceToDiscount );
            const singlePriceToDiscount = priceToDiscount / item.qty;

            let applyQuantity = limitUsageQuantity && ( limitUsageQuantity - appliedCount < item.qty ) ?
                                limitUsageQuantity - appliedCount :
                                item.qty;
            applyQuantity     = Math.max( 0, applyQuantity );

            let discount = applyFilters( 
                COUPON_CUSTOM_DISCOUNT_AMOUNT_FILTER,
                0,
                singlePriceToDiscount,
                coupon,
                item,
                items
            );

            discount    = addNumberPrecision( discount * applyQuantity );
            discount    = Math.floor( Math.min( discountedPrice, discount ) );

            totalDiscount += discount;
            appliedCount  += applyQuantity;

            this.#discounts[ coupon.code ][ item.cartItemKey ] += discount;
        } );

        // Allow post-processing for custom coupon types (e.g. calculating discrepancy, etc).
        this.#discounts[ coupon.code ] = applyFilters( 
            COUPON_CUSTOM_DISCOUNTS_ARRAY_FILTER,
            this.#discounts[ coupon.code ],
            coupon
        );

        return totalDiscount;
    }
    /** -----------------------------------------------
     * Coupon Validation
     */

    isCouponValid = ( coupon ) => {
        try {
            this.validateCouponUsageLimit( coupon );
            this.validateCouponUser( coupon );
            this.validateCouponExpiryDate( coupon );
            this.validateCouponMinimumAmount( coupon );
            this.validateCouponMaximumAmount( coupon );
            this.validateCouponProductIds( coupon );
            this.validateCouponProductCategories( coupon );
            this.validateCouponExcludedItems( coupon ); // use $coupon->is_valid_for_product
            this.validateCouponEligibleItems( coupon );

            return true;
        } catch ( error ) {
            if ( error instanceof CartCouponError ) {
                return error;
            } else {
                throw error;
            }
        }

    };

    isCouponValidForProduct = ( coupon, product ) => {
        let valid = false;
        if ( this.isProductCoupon( coupon ) ) {
            const productCategories = CartDiscounts.getProductCategories( product );

            // Specific products get the discount.
            if ( coupon.product_ids.length && ( coupon.product_ids.indexOf( product.id ) >= 0 || coupon.product_ids.indexOf( product.parent_id ) >= 0 ) ) {
                valid = true;
            }

            // Category discounts.
            if ( coupon.product_categories.length ) {
                const categoryIntersection = productCategories.filter( cat => coupon.product_categories.includes( cat.id ) );

                if ( categoryIntersection.length ) {
                    valid = true;
                }
            }

            // No product ids - all items discounted.
            if ( !coupon.product_ids.length && !coupon.product_categories.length ) {
                valid = true;
            }

            // Specific product IDs excluded from the discount.
            if ( coupon.excluded_product_ids.length && ( coupon.excluded_product_ids.indexOf( product.id ) >= 0 || coupon.excluded_product_ids.indexOf( product.parent_id ) >= 0 ) ) {
                valid = false;
            }

            // Specific categories excluded from the discount.
            if ( coupon.excluded_product_categories.length ) {
                const categoryIntersection = productCategories.filter( cat => coupon.excluded_product_categories.includes( cat.id ) );

                if ( categoryIntersection.length ) {
                    valid = false;
                }
            }

            // Sale Items excluded from discount.
            if ( coupon.exclude_sale_items && product.on_sale ) {
                valid = false;
            }
        }

        return applyFilters(
            COUPON_IS_VALID_FOR_PRODUCT_FILTER,
            valid,
            coupon,
            product,
        );
    };

    isCouponValidForCart = ( coupon ) => {
        let valid =  this.isCartCoupon( coupon );

        return applyFilters(
            COUPON_IS_VALID_FOR_CART_FILTER,
            valid,
            coupon,
        );
    };

    isProductCoupon = ( coupon ) => {
        return applyFilters(
            IS_PRODUCT_COUPON_FILTER,
            'fixed_product' === coupon.discount_type || 'percent' === coupon.discount_type,
            coupon
        );
    };

    isCartCoupon = ( coupon ) => {
        return applyFilters(
            IS_CART_COUPON_FILTER,
            'fixed_cart' === coupon.discount_type,
            coupon
        );
    };

    validateCouponUsageLimit = ( coupon ) => {
        if ( coupon.usage_limit && coupon.usage_count >= coupon.usage_limit ) {
            throw new CartCouponError( couponErrors.usageLimitReached );
        }
        return true;
    };

    isCouponEmailsAllowed = ( checkEmails, restrictions ) => {
        for ( let i in checkEmails ) {
            const email = checkEmails[ i ];

            if ( restrictions.indexOf( email ) >= 0 ) {
                return true;
            }

            for ( let j in restrictions ) {
                const restriction = restrictions[ j ];
                const regex       = new RegExp( '^' + restriction.replace( '*', '(.+)?' ) + '$' );
                if ( email.search( regex ) >= 0 ) {
                    return true;
                }
            }

        }
    };

    validateCouponUser = ( coupon ) => {
        const user = this.#cartManager.getCartCustomer();
        if ( coupon.email_restrictions.length ) {
            let valid = false;
            if ( user.id ) {
                let emails = user.email !== user.billing.email ? [user.email, user.billing.email] : [user.email];
                emails     = emails.filter( email => typeof email === 'string' );

                if ( this.isCouponEmailsAllowed( emails, coupon.email_restrictions ) ) {
                    valid = true;
                }
            }

            if ( !valid ) {
                throw new CartCouponError( couponErrors.notApplicableToCustomer );
            }
        }

        this.validateCouponUserUsageLimit( coupon );

        return true;
    };

    validateCouponUserUsageLimit = ( coupon ) => {
        if ( coupon.usage_limit_per_user > 0 ) {
            const user       = this.#cartManager.getCartCustomer();
            const usageCount = coupon.used_by.filter( id => parseInt( id ) === parseInt( user.id ) ).length;

            if ( usageCount >= coupon.usage_limit_per_user ) {
                throw new CartCouponError( couponErrors.usageLimitReached );
            }

        }
        return true;
    };

    validateCouponExpiryDate = ( coupon ) => {
        const expireDate = coupon.date_expires ? new Date( coupon.date_expires ) : false;
        const now        = new Date();

        if ( expireDate && now.getTime() > expireDate.getTime() ) {
            throw new CartCouponError( couponErrors.expired );
        }
        return true;
    };

    validateCouponMinimumAmount = ( coupon ) => {
        const subTotal      = this.getCartSubtotal();
        const minimumAmount = parseFloat( coupon.minimum_amount );

        if ( minimumAmount > 0 && minimumAmount > subTotal ) {
            throw new CartCouponError( sprintf( couponErrors.minSpendLimitNotMet, formatCurrency( minimumAmount ) ) );
        }
        return true;
    };

    validateCouponMaximumAmount = ( coupon ) => {
        const subTotal      = this.getCartSubtotal();
        const maximumAmount = parseFloat( coupon.maximum_amount );

        if ( maximumAmount > 0 && maximumAmount < subTotal ) {
            throw new CartCouponError( sprintf( couponErrors.maxSpendLimitMet, formatCurrency( maximumAmount ) ) );
        }
    };

    validateCouponProductIds = ( coupon ) => {
        if ( coupon.product_ids.length ) {
            let valid   = false;
            const items = this.getItems();

            for ( let i in items ) {
                const item = items[ i ];
                if ( item.product && ( coupon.product_ids.indexOf( item.product.id ) >= 0 || coupon.product_ids.indexOf( item.product.parent_id ) >= 0 ) ) {
                    valid = true;
                    break;
                }
            }
            if ( !valid ) {
                throw new CartCouponError( couponErrors.notApplicableSelectedProducts );
            }

        }
        return true;
    };

    validateCouponProductCategories = ( coupon ) => {
        if ( coupon.product_categories.length ) {
            const items = this.getItems();
            let valid   = false;
            if ( items.length ) {
                for ( let i in items ) {
                    const item = items[ i ];
                    if ( coupon.exclude_sale_items && item.product && item.product.on_sale ) {
                        continue;
                    }
                    let productCategories = CartDiscounts.getProductCategories( item.product );
                    const categoryIds     = productCategories.filter( cat => coupon.product_categories.includes( cat.id ) );

                    if ( categoryIds.length ) {
                        valid = true;
                        break;
                    }
                }
            }
            if ( !valid ) {
                throw new CartCouponError( couponErrors.notApplicableSelectedProducts );
            }
        }
        return true;
    };

    validateCouponExcludedItems = ( coupon ) => {
        if ( this.isProductCoupon( coupon ) ) {
            const items = this.getItems();
            if ( items.length ) {
                let valid = false;

                for ( let i in items ) {
                    const item = items[ i ];
                    if ( item.product && this.isCouponValidForProduct( coupon, item.product ) ) {
                        valid = true;
                        break;
                    }
                }
                if ( !valid ) {
                    throw new CartCouponError( couponErrors.notApplicableSelectedProducts );
                }
            }
        }
        return true;
    };

    validateCouponEligibleItems = ( coupon ) => {
        if ( !this.isProductCoupon( coupon ) ) {

            this.validateCouponSaleItems( coupon );
            this.validateCouponExcludedProductIds( coupon );
            this.validateCouponExcludedProductCategories( coupon );
        }
        return true;
    };

    validateCouponSaleItems = ( coupon ) => {
        if ( coupon.exclude_sale_items ) {
            let valid   = true;
            const items = this.getItems();

            for ( let i in items ) {
                const item = items[ i ];
                if ( item.product && item.product.on_sale ) {
                    valid = false;
                    break;
                }
            }
            if ( !valid ) {
                throw new CartCouponError( couponErrors.notApplicableSaleItems );
            }
        }
        return true;
    };

    validateCouponExcludedProductIds = ( coupon ) => {
        if ( coupon.excluded_product_ids.length ) {
            let products = [];
            const items  = this.getItems();

            for ( let i in items ) {
                const item = items[ i ];
                if ( item.product && ( coupon.excluded_product_ids.indexOf( item.product.id ) >= 0 || coupon.excluded_product_ids.indexOf( item.product.parent_id ) >= 0 ) ) {
                    products.push( item.product.name );
                }
            }
            if ( products.length ) {
                throw new CartCouponError( sprintf( couponErrors.notApplicableExcludedProducts, products.join( ', ' ) ) );
            }

        }
        return true;
    };

    validateCouponExcludedProductCategories = ( coupon ) => {
        if ( coupon.excluded_product_categories.length ) {
            const items    = this.getItems();
            let categories = {};

            for ( let i in items ) {
                const item = items[ i ];
                if ( !item.product ) {
                    continue;
                }

                let productCategories    = CartDiscounts.getProductCategories( item.product );
                const excludedCategories = productCategories.filter( cat => coupon.excluded_product_categories.includes( cat.id ) );

                categories = excludedCategories.reduce( ( acc, cat ) => {
                    acc[ cat.id ] = cat.name;
                    return acc;
                }, categories );
            }

            const categoriesArray = Object.values( categories );
            if ( categoriesArray.length ) {
                throw new CartCouponError( sprintf( couponErrors.notApplicableExcludedCategories, categoriesArray.join( ', ' ) ) );
            }
        }
    };
}