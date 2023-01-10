import React, { Component, Fragment } from 'react';

import { Chart }                from '@woocommerce/components';
import { format as formatDate } from '@wordpress/date';
import { __ }                   from '@wordpress/i18n';


import { getAllowedIntervalsForQuery, getIntervalForQuery, getCurrentDates, getPreviousDate, getChartTypeForQuery } from '@woocommerce/date';
import { getTooltipValueFormat }                                                                                    from '../../lib/utils';

class OrderChart extends Component {
    getTimeChartData() {
        const { query, stats, selectedChart, isRequesting } = this.props;
        const currentInterval                               = getIntervalForQuery( query );
        const { primary, secondary }                        = getCurrentDates( query );

        if ( isRequesting ) {
            return [];
        }

        const chartData = stats.primary.data.intervals.map( function ( interval, index ) {
            const secondaryDate = getPreviousDate(
                interval.date_start,
                primary.after,
                secondary.after,
                query.compare,
                currentInterval
            );

            const secondaryInterval = stats.secondary.data.intervals[ index ];
            return {
                date     : formatDate( 'Y-m-d\\TH:i:s', interval.date_start ),
                primary  : {
                    label    : `${primary.label} (${primary.range})`,
                    labelDate: interval.date_start,
                    value    : interval.subtotals[ selectedChart.key ] || 0
                },
                secondary: {
                    label    : `${secondary.label} (${secondary.range})`,
                    labelDate: secondaryDate.format( 'YYYY-MM-DD HH:mm:ss' ),
                    value    : ( secondaryInterval && secondaryInterval.subtotals[ selectedChart.key ] ) || 0
                }
            };
        } );
        return chartData;
    }

    render() {
        const { query, charts, selectedChart, isRequesting } = this.props;
        const allowedIntervals                               = getAllowedIntervalsForQuery( query );

        return <Fragment>
            <Chart
                title={selectedChart.label}
                allowedIntervals={allowedIntervals}
                interval={query.interval}
                isRequesting={isRequesting}
                layout="time-comparison"
                data={this.getTimeChartData()}
                tooltipValueFormat={getTooltipValueFormat( selectedChart.type )}
                chartType={getChartTypeForQuery( query )}
                emptyMessage={__( 'No data for the selected date range', 'yith-point-of-sale-for-woocommerce' )}
            />
        </Fragment>
    }
}

export default OrderChart;

