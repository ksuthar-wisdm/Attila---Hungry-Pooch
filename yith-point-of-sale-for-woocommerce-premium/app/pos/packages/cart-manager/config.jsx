import { __ } from '@wordpress/i18n';

export const couponErrors = {
    usageLimitReached              : __( 'Coupon usage limit has been reached.', 'yith-point-of-sale-for-woocommerce' ),
    expired                        : __( 'This coupon has expired.', 'yith-point-of-sale-for-woocommerce' ),
    minSpendLimitNotMet            : __( 'The minimum spend for this coupon is %s.', 'yith-point-of-sale-for-woocommerce' ),
    maxSpendLimitMet               : __( 'The maximum spend for this coupon is %s.', 'yith-point-of-sale-for-woocommerce' ),
    notApplicable                  : __( 'Sorry, this coupon is not applicable to your cart contents.', 'yith-point-of-sale-for-woocommerce' ),
    notApplicableSelectedProducts  : __( 'Sorry, this coupon is not applicable to selected products.', 'yith-point-of-sale-for-woocommerce' ),
    notApplicableSaleItems         : __( 'Sorry, this coupon is not valid for sale items.', 'yith-point-of-sale-for-woocommerce' ),
    notApplicableExcludedProducts  : __( 'Sorry, this coupon is not applicable to the products: %s.', 'yith-point-of-sale-for-woocommerce' ),
    notApplicableExcludedCategories: __( 'Sorry, this coupon is not applicable to the categories: %s.', 'yith-point-of-sale-for-woocommerce' ),
    notApplicableToCustomer        : __( 'Sorry, this coupon is not usable by the current customer.', 'yith-point-of-sale-for-woocommerce' )
};