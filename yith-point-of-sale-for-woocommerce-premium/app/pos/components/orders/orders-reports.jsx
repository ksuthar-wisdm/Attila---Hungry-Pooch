import React, { useEffect, useMemo, useState } from 'react';
import classNames                              from 'classnames';
import { __, sprintf }                         from '@wordpress/i18n';
import { addQueryArgs }                        from '@wordpress/url';
import apiFetch                                from '@wordpress/api-fetch';

import { formatCurrency } from '../../packages/numbers';

export default function OrdersReports( { orders } ) {
	const orderIds                  = useMemo( () => orders.map( _ => _.id ), [orders] );
	const [reports, setReports]     = useState( [] );
	const [isLoading, setIsLoading] = useState( true );
	const [error, setError]         = useState( '' );

	const classes = classNames(
		'orders-reports',
		{ 'is-loading': isLoading }
	);

	useEffect( () => {
		const apiOptions = {
			path  : addQueryArgs(
				`/yith-pos/v1/orders-stats`,
				{ order__in: orderIds.length ? orderIds : [0], format: 'flat' }
			),
			method: 'GET'
		};
		setError( '' );
		apiFetch( apiOptions ).then(
			generatedReports => {
				setReports( generatedReports );
				setIsLoading( false );
			},
			errorResponse => {
				console.log( errorResponse );
				setError(
					sprintf(
						// translators: %s is the error message.
						__( 'An error occurred while generating reports: %s', 'yith-point-of-sale-for-woocommerce' ),
						errorResponse?.message ?? errorResponse?.code ?? ''
					)
				);
				setIsLoading( false );
			}
		)
	}, [] );

	return <div className={classes}>
		{!!reports.length && reports.map( ( report ) => {
			const reportType     = report?.type ?? 'price';
			const formattedValue = 'price' === reportType ? formatCurrency( report.value ) : report.value;
			return <div className={classNames( 'report', report.id )} key={report.id}>
				<span className="report__title">{report.title}</span>
				<span className="report__value">{formattedValue}</span>
			</div>
		} )}
		{!!error && <p className="inline-error">{error}</p>}
	</div>
}