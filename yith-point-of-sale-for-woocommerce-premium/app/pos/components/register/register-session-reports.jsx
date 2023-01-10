import React, { useEffect, useState } from 'react';
import classNames                     from 'classnames';
import apiFetch                       from '@wordpress/api-fetch';
import { __, sprintf }                from '@wordpress/i18n';
import { addQueryArgs }               from '@wordpress/url';

import { formatCurrency } from '../../packages/numbers';

const CURRENT_SESSION_ID = yithPosSettings?.register?.session?.id ?? 0;

export default function RegisterSessionReports( { registerManager, isClosing = false } ) {
	const [reports, setReports]     = useState( [] );
	const [isLoading, setIsLoading] = useState( true );
	const [error, setError]         = useState( '' );

	const classes = classNames(
		'register-session-reports',
		{
			'is-loading': isLoading
		}
	);

	const generalReports = [
		{ id: 'opening-time', title: __( 'Opening time', 'yith-point-of-sale-for-woocommerce' ), value: registerManager.getOpeningTime() },
		isClosing ? { id: 'closing-time', title: __( 'Closing time', 'yith-point-of-sale-for-woocommerce' ), value: registerManager.getClosingTime() } : false,
		{ id: 'cashiers', title: __( 'Cashiers', 'yith-point-of-sale-for-woocommerce' ), value: registerManager.getCashiers() }
	].filter( _ => !!_ );

	useEffect( () => {
		const apiOptions = {
			path  : addQueryArgs(
				`/yith-pos/v1/register-sessions/${CURRENT_SESSION_ID}/generate_reports`,
				{ format: 'flat' }
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
		{generalReports.map( stat => {
			return <div className={classNames( 'report', 'report--general', stat.id )} key={stat.id}>
				<span className="report__title">{stat.title}</span>
				<span className="report__value">{stat.value}</span>
			</div>
		} )}
		{!!reports.length && reports.map( ( report ) => {
			const reportType     = report?.type ?? 'price';
			const formattedValue = 'price' === reportType ? formatCurrency( report.value ) : report.value;
			return <div className={classNames( 'report', 'report--total', report.id )} key={report.id}>
				<span className="report__title">{report.title}</span>
				<span className="report__value">{formattedValue}</span>
			</div>
		} )}
		{!!error && <p className="inline-error">{error}</p>}
	</div>
}