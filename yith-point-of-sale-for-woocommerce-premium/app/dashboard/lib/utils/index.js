import { formatCurrency } from '../../../pos/packages/numbers';

import { getDateParamsFromQuery, getCurrentDates } from '@woocommerce/date';

export function getTooltipValueFormat( type ) {
    switch ( type ) {
        case 'currency':
            return formatCurrency;
        case 'percent':
            return '.0%';
        case 'number':
            return ',';
        case 'average':
            return ',.2r';
        default:
            return ',';
    }
}

export function getDateQuery( query ) {
    const { period, compare, before, after }                 = getDateParamsFromQuery( query );
    const { primary: primaryDate, secondary: secondaryDate } = getCurrentDates( query );
    return {
        period,
        compare,
        before,
        after,
        primaryDate,
        secondaryDate
    };
}