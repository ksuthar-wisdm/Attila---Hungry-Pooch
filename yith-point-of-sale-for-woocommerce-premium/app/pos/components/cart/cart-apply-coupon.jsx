import React, { Component, Fragment } from 'react';

import { i18n_cart_label as labels } from './config';
import { __ }                        from '@wordpress/i18n';
import apiFetch                      from '@wordpress/api-fetch';
import { addQueryArgs }              from '@wordpress/url';
import { dateI18n }                  from '@wordpress/date';
import { loggerStore }               from '../logger';
import { formatCurrency }            from '../../packages/numbers';
import Button                        from '../../packages/components/button';

class CartApplyCoupon extends Component {

    activePromise = false;

    constructor() {
        super( ...arguments );

        this.state = {
            search     : '',
            coupon     : {},
            loading    : false,
            error      : false,
            validCoupon: false
        };
    }

    onSearch = ( event ) => {
        const search = event.target.value;
        this.setState( { loading: true, validCoupon: false, error: false, search } );

        if ( search.length >= 2 ) {
            const promise = ( this.activePromise = apiFetch( {
                                                                 path: addQueryArgs( 'wc/v3/coupons', {
                                                                     per_page: 1,
                                                                     code    : search
                                                                 } )
                                                             } )
                .then( ( coupons ) => {
                    if ( promise !== this.activePromise ) {
                        return;
                    }

                    if ( coupons.length ) {
                        const coupon = coupons[ 0 ];
                        this.setState( { coupon: coupon, validCoupon: true } );

                        loggerStore.addLog( 'last-valid-searched-coupon', 'Last Valid Searched Coupon', coupon );
                    } else {
                        this.setState( {
                                           error      : __( 'Coupon not found', 'yith-point-of-sale-for-woocommerce' ),
                                           validCoupon: false
                                       } );
                    }
                    this.setState( { loading: false } );
                } ) );
        } else {
            this.setState( { coupon: {}, validCoupon: false, loading: false } );
        }
    };

    handleSubmit = ( event ) => {
        event.preventDefault();
        const { coupon, validCoupon, error } = this.state;
        if ( validCoupon && !error ) {
            this.props.addCoupon( coupon );
        }
    };

    render() {
        const { formattedCartTotal, getTestTotalWithCoupon }  = this.props;
        const { coupon, validCoupon, error, loading, search } = this.state;
        const { discount_type, amount, date_expires }         = coupon;

        const couponType = discount_type in yithPosSettings.wc.couponTypes ? yithPosSettings.wc.couponTypes[ discount_type ] : discount_type;

        let hasError     = error && search.length >= 2;
        let currentError = error;
        let amountToPay  = formattedCartTotal;
        if ( !hasError && validCoupon ) {
            const totalWithCoupon = getTestTotalWithCoupon( coupon );
            if ( totalWithCoupon instanceof Error ) {
                hasError     = true;
                currentError = totalWithCoupon.message;
            } else {
                amountToPay = formatCurrency( totalWithCoupon );
            }
        }

        return (
            <div>
                <form onSubmit={this.handleSubmit}
                      className={"cart-apply-coupon" + ( hasError ? ' cart-apply-coupon--has-error' : '' )}
                      autoComplete="off">
                    <div className='form-group cart-apply-coupon__coupon-code-wrapper'>
                        <label>{labels.enterCouponCode}</label>
                        <input type='text' autoFocus={true} onChange={this.onSearch}/>
                    </div>
                    {hasError &&
                     <div className='coupon-data coupon-data--error'>{currentError}</div>}
                    {!hasError &&
                     <Fragment>
                         <div
                             className={loading ? 'coupon-data coupon-data--loading is-loading is-loading--opaque-white' : 'coupon-data'}>
                             <div className='coupon-data__discount-type'>
                                 <label>{__( 'Discount type:', 'yith-point-of-sale-for-woocommerce' )}</label>
                                 <span>{validCoupon ? couponType : '-'}</span>
                             </div>
                             <div className='coupon-data__amount'>
                                 <label>{__( 'Coupon amount:', 'yith-point-of-sale-for-woocommerce' )}</label>
                                 <span>{validCoupon ? amount : '-'}</span>
                             </div>
                             <div className='coupon-data__expiry-date'>
                                 <label>{__( 'Expiry date:', 'yith-point-of-sale-for-woocommerce' )}</label>
                                 <span>{validCoupon && date_expires ? dateI18n( yithPosSettings.dateFormat, date_expires ) : '-'}</span>
                             </div>
                         </div>
                     </Fragment>
                    }
                    <div className='form-group form-group-amountToPay'>
                        <label>{labels.amountToPayLabel}</label>
                        <input type='text' readOnly={true} value={amountToPay}/>
                    </div>

                    <Button variant="primary" disabled={hasError || !validCoupon} fullWidth>{labels.applyCouponButton}</Button>
                </form>
            </div>
        );
    }
}

export default CartApplyCoupon;