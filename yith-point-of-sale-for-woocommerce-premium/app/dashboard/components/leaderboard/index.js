/** @format */
/**
 * External dependencies
 */
import { __ }        from '@wordpress/i18n';
import { Component } from '@wordpress/element';

/**
 * WooCommerce dependencies
 */
import { TableCard } from '@woocommerce/components';
import React         from 'react';

export class Leaderboard extends Component {
	getFormattedHeaders() {
		return this.props.headers.map( ( header, i ) => {
			return {
				isLeftAligned  : 0 === i,
				hiddenByDefault: false,
				isSortable     : false,
				key            : header.label,
				label          : header.label
			};
		} );
	}

	getFormattedRows() {
		return this.props.rows.map( row => {
			return row.map( column => {
				return {
					display: <div dangerouslySetInnerHTML={{ __html: column.display }}/>,
					value  : column.value
				};
			} );
		} );
	}

	render() {
		const { isRequesting, isError, totalRows, title } = this.props;
		const rows                                        = this.getFormattedRows();

		// Set minimum value to 1 to prevent showing pagination if there is no data to display.
		const _totalRows = Math.max( 1, totalRows );

		return (
			<TableCard className="woocommerce-leaderboard woocommerce-analytics__card"
				headers={this.getFormattedHeaders()}
				isLoading={isRequesting}
				rows={rows}
				rowsPerPage={_totalRows}
				showMenu={false}
				title={title}
				totalRows={_totalRows}
			/>
		);
	}
}

Leaderboard.defaultProps = {
	rows        : [],
	isError     : false,
	isRequesting: false
};

export default Leaderboard;
