import React, { Component, Fragment }                                            from 'react';
import { getCashiersReportData, getOrderChartData, getPaymentMethodsReportData } from '../../packages/data';
import Leaderboard                                                               from '../leaderboard';
import { isEqual }                                                               from 'lodash';
import { __ }                                                                    from '@wordpress/i18n';
import { formatCurrency }                                                        from '../../../pos/packages/numbers';


class DashboardLeaderboards extends Component {
    constructor() {
        super( ...arguments );

        this.state = {
            cashiersReport            : [],
            cashiersIsRequesting      : true,
            paymentMethodsReport      : [],
            paymentMethodsIsRequesting: true
        };
    }

    componentDidMount() {
        this.update();
    }

    getQueryWithoutChart = ( query ) => {
        const { chart, chartType, ...newQuery } = query;
        return { ...newQuery };
    };

    componentDidUpdate( prevProps, prevState ) {
        if ( !isEqual( prevProps.query, this.props.query ) ) {
            const prevQuery    = this.getQueryWithoutChart( prevProps.query );
            const currentQuery = this.getQueryWithoutChart( this.props.query );

            if ( !isEqual( prevQuery, currentQuery ) ) {
                this.update();
            } else {
                this.setState( {} );
            }
        }
    }

    update = () => {
        const { query } = this.props;
        this.setState( { cashiersIsRequesting: true } );
        this.setState( { paymentMethodsIsRequesting: true } );

        getCashiersReportData( query ).then( report => {
            const { data } = report;
            this.setState( { cashiersReport: data, cashiersIsRequesting: false } );
        } );

        getPaymentMethodsReportData( { ...query, include_empty: true, per_page: yithPosSettings.paymentMethods.enabledIds.length } ).then( report => {
            const { data } = report;
            this.setState( { paymentMethodsReport: data, paymentMethodsIsRequesting: false } );
        } );
    };

    getCashiersReportHeaders = () => {
        return [
            { label: __( 'Cashier', 'yith-point-of-sale-for-woocommerce' ) },
            { label: __( 'Orders', 'yith-point-of-sale-for-woocommerce' ) },
            { label: __( 'Net Sales', 'yith-point-of-sale-for-woocommerce' ) }
        ];
    };

    getCashiersReportRows = () => {
        const { cashiersReport } = this.state;

        return cashiersReport.map( cashier => {
            return [
                { display: cashier.extended_info.name, value: cashier.extended_info.name },
                { display: cashier.orders_count, value: cashier.orders_count },
                { display: formatCurrency( cashier.net_revenue ), value: cashier.net_revenue }
            ]
        } );
    };

    getPaymentMethodsReportHeaders = () => {
        return [
            { label: __( 'Payment Method', 'yith-point-of-sale-for-woocommerce' ) },
            { label: __( 'Orders', 'yith-point-of-sale-for-woocommerce' ) },
            { label: __( 'Amount', 'yith-point-of-sale-for-woocommerce' ) }
        ];
    };

    getPaymentMethodsReportRows = () => {
        const { paymentMethodsReport } = this.state;

        return paymentMethodsReport.map( paymentMethod => {
            return [
                { display: paymentMethod.payment_method_name, value: paymentMethod.payment_method_name },
                { display: paymentMethod.orders_count, value: paymentMethod.orders_count },
                { display: formatCurrency( paymentMethod.amount ), value: paymentMethod.amount }
            ]
        } );
    };

    render() {
        const { query }                                            = this.props;
        const { cashiersIsRequesting, paymentMethodsIsRequesting } = this.state;

        const cashiersReportRows = this.getCashiersReportRows();
        const cashiersRows       = !cashiersIsRequesting ? cashiersReportRows.length : 5; // 5 rows for placeholder

        const paymentMethodsRows = yithPosSettings.paymentMethods.enabledIds.length;

        return (
            <div className='yith-pos-dashboard__leaderboards'>
                <Leaderboard title={__( 'Payment Methods', 'yith-point-of-sale-for-woocommerce' )} query={query} totalRows={paymentMethodsRows}
                             isRequesting={paymentMethodsIsRequesting}
                             headers={this.getPaymentMethodsReportHeaders()}
                             rows={this.getPaymentMethodsReportRows()}/>
                <Leaderboard title={__( 'Top Cashiers', 'yith-point-of-sale-for-woocommerce' )} query={query} totalRows={cashiersRows}
                             isRequesting={cashiersIsRequesting}
                             headers={this.getCashiersReportHeaders()}
                             rows={cashiersReportRows}/>
            </div>
        )
    }
}

export default DashboardLeaderboards;