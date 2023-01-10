import React, { Component, Fragment }                         from 'react';

import { formatCurrency, numberFormat }                       from '../../../pos/packages/numbers';

import { SummaryNumber, SummaryList, SummaryListPlaceholder } from '@woocommerce/components';
import { calculateDelta } from '@woocommerce/number';
import { getNewPath }     from '@woocommerce/navigation';


class OrderSummary extends Component {
    getValues( key, type ) {
        const { stats }      = this.props;
        const primaryValue   = stats.primary.data.totals[ key ];
        const secondaryValue = stats.secondary.data.totals[ key ];

        return {
            delta    : calculateDelta( primaryValue, secondaryValue ),
            prevValue: this.formatVal( secondaryValue, type ),
            value    : this.formatVal( primaryValue, type )
        };
    }

    formatVal = ( value, type ) => {
        return 'currency' === type ? formatCurrency( value ) : numberFormat( value, 0 );
    };

    render() {
        const { isRequesting, stats, charts, selectedChart } = this.props;

        if ( isRequesting || !stats ) {
            return <SummaryListPlaceholder numberOfItems={charts.length}/>;
        }


        return <SummaryList>
            {() => {
                return charts.map( ( chart ) => {
                    const { key, order, orderby, label, type } = chart;
                    const { value, prevValue, delta }          = this.getValues( key, type );

                    const newPath = { chart: key };
                    if ( orderby ) {
                        newPath.orderby = orderby;
                    }
                    if ( order ) {
                        newPath.order = order;
                    }
                    const href       = getNewPath( newPath );
                    const isSelected = selectedChart.key === key;
                    return <SummaryNumber
                        key={key}
                        label={label}
                        value={value}
                        prevValue={prevValue}
                        delta={delta}
                        href={href}
                        selected={isSelected}
                    />
                } )
            }}
        </SummaryList>
    }
}

export default OrderSummary;

