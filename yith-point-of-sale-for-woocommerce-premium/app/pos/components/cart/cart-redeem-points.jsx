/* Added by WisdmLabs */
import React, { Component, Fragment } from 'react';

import { i18n_cart_label as labels } from './config';
import { __ }                        from '@wordpress/i18n';
import apiFetch                      from '@wordpress/api-fetch';
import { addQueryArgs }              from '@wordpress/url';
import { formatCurrency }            from '../../packages/numbers';
import Button                        from '../../packages/components/button';

class CartRedeemPoints extends Component {

    activePromise = false;

    constructor() {
        super( ...arguments );

        this.state = {
            key         : this.props.currentPoints?.key ?? undefined,
            points      : parseInt( this.props.currentPoints?.reason ?? 0 ),
            old_points  : parseInt( this.props.currentPoints?.reason ?? 0 ),
            discount    : this.props.currentPoints?.amount ?? 0,
            discountType: this.props.currentPoints?.typeAmount ?? '-',
            error       : false,
            validPoints : this.props.currentPoints?.typeAmount ?? false,
            loading     : false
        };

        this.abortRef = React.createRef();
    }

    onChange = async ( event ) => {
        const points     = event.target.value;
        this.setState( {
            validPoints: false,
            error      : false,
            points     : points
        } );

        let maxPoints = this.props.customer.points + this.state.old_points;

        let error       = false;
        if ( points < 0 ) {
            error = __( 'Points can not be less than 0!', 'yith-point-of-sale-for-woocommerce' );
        } else if ( points > maxPoints ) {
            error = __( 'Points must be less than max available points!', 'yith-point-of-sale-for-woocommerce' );
        }

        this.setState( {
            points     : points,
            validPoints: points != 0 && ! error,
            error      : error
        } );

        if ( points > 0 ) {
            const { cartTotals, currentPoints } = this.props;

            this.setState( { loading: true } );

            let data = {
                redeem_points: points,
                max_points   : maxPoints,
                user_id      : this.props.customer.id
            };

            if ( this.abortRef.current ) {
                this.abortRef.current.abort();
            }

            this.abortRef.current = new AbortController();

            await apiFetch( {
                path: addQueryArgs( 'wdm_yith_customisation/v1/redeem_points', data ),
                signal: this.abortRef.current?.signal
            } ).then( redeem => {

                let discount = redeem.value;
                if ( redeem.type === 'percentage' ) {
                    discount = cartTotals.subtotal * ( discount / 100 );
                }

                discount = Math.round( discount * 100 ) / 100;
                this.setState( {
                    loading      : false,
                    discount     : discount,
                    discountType : redeem.type
                } );

                this.abortRef.current = null;

                let cartTotal = cartTotals.total + ( currentPoints?.amount ?? 0 );

                if ( cartTotal - discount < 0 ) {
                    this.setState( {
                        loading    : false,
                        validPoints: false,
                        error      : __( 'Reduce number of points. Order total is invalid!', 'yith-point-of-sale-for-woocommerce' )
                    } );
                }

            } ).catch( error => {
                console.log( 'Error => ' + error.message );
                if ( error.data?.status === 404 ) {
                    this.setState( {
                        loading    : false,
                        validPoints: false,
                        error      : error.message
                    } );
                }
            } );
        }
    };

    handleSubmit = ( event ) => {
        event.preventDefault();
        const { key, points, old_points, discount, discountType, validPoints, error } = this.state;
        if ( validPoints && ! error ) {
            let pointsDiscount = {
                key       : key,
                type      : 'discount',
                typeAmount: discountType,
                amount    : discount,
                percentage: discountType === 'percentage',
                reason    : __( `${points} points redeemed...`, 'yith-point-of-sale-for-woocommerce' ),
                is_points : true,
                points    : points,
                old_points: old_points
            };

            this.props.redeemAndApplyPoints( pointsDiscount );
        }
    };

    render() {
        let { customer, cartTotals, currentPoints } = this.props;
        let { points, old_points, discount, amount, discountType, error, validPoints, loading } = this.state;

        let cartTotal   = cartTotals.total + ( currentPoints?.amount ?? 0 );
        let amountToPay = formatCurrency( cartTotal );
        let hasError    = error;
        if ( ! hasError && validPoints ) {
            const totalWithPoints = cartTotal - discount;
            amountToPay           = formatCurrency( totalWithPoints );
        }

        return (
            <div>
                <form onSubmit={this.handleSubmit}
                      className={ "cart-redeem-points cart-apply-coupon" + ( hasError ? ' cart-redeem-points--has-error cart-apply-coupon--has-error' : '' )}
                      autoComplete="off">
                    <div className='form-group cart-redeem-points__points-wrapper cart-apply-coupon__coupon-code-wrapper'>
                        <label>{ labels.enterRedeemPoints }</label>
                        <input type='number' autoFocus={ true } onChange={ this.onChange } value={ points } />
                    </div>
                    {
                        hasError &&
                        <div className='points-data points-data--error coupon-data coupon-data--error'>{ error }</div>
                    } {
                        ! hasError &&
                        <Fragment>
                            <div className={ 'coupon-data points-data ' + ( loading ? 'coupon-data--loading is-loading is-loading--opaque-white' : '' ) }>
                                <div className='points__discount-type'>
                                    <label>{__( 'Discount type:', 'yith-point-of-sale-for-woocommerce' )}</label>
                                    <span>{ validPoints ? discountType : '-' }</span>
                                </div>
                                <div className='points__discount'>
                                    <label>{__( 'Discount:', 'yith-point-of-sale-for-woocommerce' )}</label>
                                    <span>{ validPoints ? formatCurrency( discount ) : '-' }</span>
                                </div>
                                <div className='points__discount-used'>
                                    <label>{ __( 'Points Used:', 'yith-point-of-sale-for-woocommerce' ) }</label>
                                    <span>{ validPoints ? `-${ Number( points ) }` : '-' }</span>
                                </div>
                                <div className='points__remaining'>
                                    <label>{ __( 'Points Remaining:', 'yith-point-of-sale-for-woocommerce' ) }</label>
                                    <span>{ customer.points + old_points - points }</span>
                                </div>
                            </div>
                        </Fragment>
                    }
                    {/* <div className='form-group form-group-amountToPay'>
                        <label>{ labels.amountToPayLabel }</label>
                        <input type='text' readOnly={ true } value={ amountToPay }/>
                    </div> */}

                    <Button variant="primary" disabled={ loading || hasError || ! validPoints } fullWidth>{ labels.redeemPointsButton }</Button>
                </form>
            </div>
        );
    }
}

export default CartRedeemPoints;
/* Added by WisdmLabs */