import React, { Component }              from 'react';
import { ReportFilters }                 from '@woocommerce/components';
import { getRegistersByStore }           from '../../packages/data';
import { __ }                            from '@wordpress/i18n';
import { getHistory, updateQueryString } from '@woocommerce/navigation';
import { removeQueryArgsFromPath }       from '../../packages/navigation';
import { find }                          from 'lodash';
import { getDateQuery }                  from '../../lib/utils';


class DashboardFilters extends Component {
	constructor() {
		super( ...arguments );

		this.state = {
			isLoading     : false,
			storeRegisters: []
		};

		this.onFilterSelect = this.onFilterSelect.bind( this );
	}

	componentDidMount() {
		this.updateFilters();
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.query.store !== this.props.query.store ) {
			this.removeRegisterFromQueryArgs();
			this.updateFilters();
		}
	}

	removeRegisterFromQueryArgs = () => {
		getHistory().replace( removeQueryArgsFromPath( ['register'] ) );
	};

	updateFilters = () => {
		const { store, register } = this.props.query;

		if ( store ) {
			this.setState( { isLoading: true } );

			getRegistersByStore( store ).then( ( registers ) => {
				this.setState( {
								   storeRegisters: registers.map( ( { id, name } ) => {
									   return { label: name, value: String( id ) }
								   } ),
								   isLoading     : false
							   } );

				const foundRegister = find( registers, { id: parseInt( register ) } );

				if ( register && typeof foundRegister === 'undefined' ) {
					this.removeRegisterFromQueryArgs();
				}
			} );
		}
	};

	getFilters() {
		const { isLoading } = this.state;
		const { filters }   = this.props;

		if ( isLoading ) {
			filters[ 1 ].filters = [{ label: __( 'Loading...', 'yith-point-of-sale-for-woocommerce' ), value: 'all' }];
		} else {
			filters[ 1 ].filters = [{ label: __( 'All Registers', 'yith-point-of-sale-for-woocommerce' ), value: 'all' }, ...this.state.storeRegisters];
		}
		return filters;
	}

	onFilterSelect( data ) {
		const { query, path } = this.props;
		updateQueryString( data, path, query );
	}

	render() {
		const { query, path } = this.props;
		const dateQuery       = getDateQuery( query );

		return <ReportFilters
			path={path}
			query={query}
			filters={this.getFilters()}
			currency={yithPosSettings.wc.currency}
			dateQuery={dateQuery}
			onFilterSelect={this.onFilterSelect}
		/>

	}
}

export default DashboardFilters;

