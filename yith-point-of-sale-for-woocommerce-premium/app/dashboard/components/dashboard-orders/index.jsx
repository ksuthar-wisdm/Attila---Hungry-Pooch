import React, { Component, Fragment } from 'react';
import OrderSummary                   from '../order-summary';
import DashboardFilters               from '../dashboard-filters';

import { filters, charts }                                         from './config';
import getSelectedChart                                            from '../../lib/get-selected-chart';
import { isEqual }                                                 from 'lodash';
import { getCashiersReportData, getOrderChartData, getOrderStats } from '../../packages/data';
import { getCurrentDates, appendTimestamp, getIntervalForQuery }   from '@woocommerce/date';
import OrderChart                                                  from '../order-chart';

class DashboardOrders extends Component {
    constructor() {
        super( ...arguments );

        this.state = {
            stats       : {},
            isRequesting: true
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

    update = async () => {
        const { query } = this.props;
        this.setState( { isRequesting: true } );

        const stats = {
            primary  : await getOrderChartData( { query, dataType: 'primary' } ),
            secondary: await getOrderChartData( { query, dataType: 'secondary' } )
        };

        this.setState( { stats: stats, isRequesting: false } );
    };

    render() {
        const { path, query }         = this.props;
        const { stats, isRequesting } = this.state;
        const selectedChart           = getSelectedChart( query.chart, charts );

        return (
            <Fragment>
                <DashboardFilters
                    path={path}
                    query={query}
                    filters={filters}
                    charts={charts}/>
                <OrderSummary
                    path={path}
                    query={query}
                    filters={filters}
                    charts={charts}
                    selectedChart={selectedChart}
                    stats={stats}
                    isRequesting={isRequesting}
                />
                <OrderChart
                    path={path}
                    query={query}
                    filters={filters}
                    charts={charts}
                    selectedChart={selectedChart}
                    stats={stats}
                    isRequesting={isRequesting}
                />
            </Fragment>
        )
    }
}

export default DashboardOrders;