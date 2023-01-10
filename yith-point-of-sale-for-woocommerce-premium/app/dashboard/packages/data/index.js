/* global yithPosSettings */

import { addQueryArgs } from '@wordpress/url';
import apiFetch         from '@wordpress/api-fetch';

import { getCurrentDates, appendTimestamp, getIntervalForQuery } from '@woocommerce/date';
import { forEach, isNull }                                       from 'lodash';

const MAX_PER_PAGE = 100;

export const getStoreList = () => {
    return yithPosSettings.stores;
};

export const getRegistersByStore = ( storeID ) => {
    return apiFetch( { path: addQueryArgs( `yith-pos/v1/registers`, { 'store': storeID } ) } );
};

export const getOrderStats = async ( options = {} ) => {
    const defaultOptions = {
        per_page: MAX_PER_PAGE
    };
    options              = { ...defaultOptions, ...options };

    try {
        const response     = await apiFetch( { path: addQueryArgs( `yith-pos/reports/orders/stats`, options ), parse: false } );
        const totalResults = parseInt( response.headers.get( 'x-wp-total' ) );
        const totalPages   = parseInt( response.headers.get( 'x-wp-totalpages' ) );
        const report       = await response.json();

        return {
            data: report,
            totalResults,
            totalPages
        };
    } catch ( error ) {
        return { error };
    }
};

function isReportDataEmpty( report ) {
    if ( !report ) {
        return true;
    }
    if ( !report.data ) {
        return true;
    }
    if ( !report.data.totals || isNull( report.data.totals ) ) {
        return true;
    }

    if ( !report.data.intervals || 0 === report.data.intervals.length ) {
        return true;
    }

    return false;
}

function getFilterQuery( options ) {
    return {
        store   : options.store || 0,
        register: options.register || 0
    }
}

function getRequestQuery( options ) {
    const { dataType, query } = options;
    const datesFromQuery      = getCurrentDates( query );
    const interval            = getIntervalForQuery( query );
    const filterQuery         = getFilterQuery( query );
    const end                 = datesFromQuery[ dataType ].before;

    return {
        order    : 'asc',
        interval,
        per_page : MAX_PER_PAGE,
        after    : appendTimestamp( datesFromQuery[ dataType ].after, 'start' ),
        before   : appendTimestamp( end, 'end' ),
        segmentby: query.segmentby,
        ...filterQuery
    };
}

export const getOrderChartData = async ( options = {} ) => {
    const response = {
        isEmpty: false,
        isError: false,
        data   : {
            totals   : {},
            intervals: []
        }
    };

    const requestQuery = getRequestQuery( options );
    const stats        = await getOrderStats( requestQuery );

    if ( stats.error ) {
        return { ...response, isError: true };
    } else if ( isReportDataEmpty( stats ) ) {
        return { ...response, isEmpty: true };
    }

    const totals  = ( stats && stats.data && stats.data.totals ) || null;
    let intervals = ( stats && stats.data && stats.data.intervals ) || [];

    if ( stats.totalResults > MAX_PER_PAGE ) {
        const pagedData  = [];
        const totalPages = Math.ceil( stats.totalResults / MAX_PER_PAGE );
        let isError      = false;

        let promises = [];

        for ( let i = 2; i <= totalPages; i++ ) {
            const nextQuery = { ...requestQuery, page: i };
            promises.push( getOrderStats( nextQuery ) );
        }

        const responses = await Promise.all( promises );

        for ( let i = 0; i < responses.length; i++ ) {
            const _data = responses[ i ];
            if ( _data.error ) {
                isError = true;
                break;
            }

            pagedData.push( _data );
        }

        if ( isError ) {
            return { ...response, isError: true };
        }

        forEach( pagedData, function ( _data ) {
            intervals = intervals.concat( _data.data.intervals );
        } );
    }

    return { ...response, data: { totals, intervals } };
};


export const getCashiersReport = async ( options = {} ) => {
    const defaultOptions = {
        per_page       : MAX_PER_PAGE,
        'extended_info': true
    };
    options              = { ...defaultOptions, ...options };

    try {
        const response     = await apiFetch( { path: addQueryArgs( `yith-pos/reports/cashiers`, options ), parse: false } );
        const totalResults = parseInt( response.headers.get( 'x-wp-total' ) );
        const totalPages   = parseInt( response.headers.get( 'x-wp-totalpages' ) );
        const report       = await response.json();

        return {
            data: report,
            totalResults,
            totalPages
        };
    } catch ( error ) {
        return { error };
    }
};

function getCashiersRequestQuery( query ) {
    const datesFromQuery = getCurrentDates( query );
    const interval       = getIntervalForQuery( query );
    const filterQuery    = getFilterQuery( query );
    const end            = datesFromQuery.primary.before;

    return {
        order    : 'desc',
        interval,
        per_page : 5,
        after    : appendTimestamp( datesFromQuery.primary.after, 'start' ),
        before   : appendTimestamp( end, 'end' ),
        segmentby: query.segmentby,
        ...filterQuery
    };
}

export const getCashiersReportData = async ( options = {} ) => {
    const response = {
        isEmpty: false,
        isError: false,
        data   : {}
    };

    const requestQuery = getCashiersRequestQuery( options );
    const report       = await getCashiersReport( requestQuery );

    if ( report.error ) {
        return { ...response, isError: true };
    } else if ( !report || !report.data ) {
        return { ...response, isEmpty: true };
    }

    return { ...response, data: report.data };
};

function getPaymentMethodsRequestQuery( query ) {
    const datesFromQuery = getCurrentDates( query );
    const interval       = getIntervalForQuery( query );
    const filterQuery    = getFilterQuery( query );
    const end            = datesFromQuery.primary.before;

    return {
        order        : 'desc',
        interval,
        per_page     : query.per_page || 5,
        include_empty: query.include_empty || false,
        after        : appendTimestamp( datesFromQuery.primary.after, 'start' ),
        before       : appendTimestamp( end, 'end' ),
        segmentby    : query.segmentby,
        ...filterQuery
    };
}

export const getPaymentMethodsReportData = async ( options = {} ) => {
    const response = {
        isEmpty: false,
        isError: false,
        data   : {}
    };

    const requestQuery = getPaymentMethodsRequestQuery( options );
    const report       = await getPaymentMethodsReport( requestQuery );

    if ( report.error ) {
        return { ...response, isError: true };
    } else if ( !report || !report.data ) {
        return { ...response, isEmpty: true };
    }

    return { ...response, data: report.data };
};

export const getPaymentMethodsReport = async ( options = {} ) => {
    const defaultOptions = {
        per_page: MAX_PER_PAGE
    };
    options              = { ...defaultOptions, ...options };

    try {
        const response     = await apiFetch( { path: addQueryArgs( `yith-pos/reports/payment-methods`, options ), parse: false } );
        const totalResults = parseInt( response.headers.get( 'x-wp-total' ) );
        const totalPages   = parseInt( response.headers.get( 'x-wp-totalpages' ) );
        const report       = await response.json();

        return {
            data: report,
            totalResults,
            totalPages
        };
    } catch ( error ) {
        return { error };
    }
};