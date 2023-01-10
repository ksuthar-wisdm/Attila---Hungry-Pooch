/** global yithPosSettings */
import React, { Component, Fragment } from 'react';
import { __, sprintf }                from '@wordpress/i18n';

import DropDown from './header/drop-down.jsx';

import { applyFilters }   from '@wordpress/hooks';
import Icon               from '../packages/components/icon';
import apiFetch           from '@wordpress/api-fetch';
import { addQueryArgs }   from '@wordpress/url';
import { formatCurrency } from '../packages/numbers';


const HEADER_MENU_ITEMS_FILTER = 'yith_pos_header_menu_items';
const HEADER_LINKS_FILTER      = 'yith_pos_header_links';

const headerLinks = applyFilters( HEADER_LINKS_FILTER, [
	{
		className: 'manage-store-link',
		url      : yithPosSettings.adminUrl,
		title    : __( 'Manage Store', 'yith-point-of-sale-for-woocommerce' ),
		show     : 'yith_pos_create_products' in yithPosSettings.user.posCaps
	},
	{
		className: 'register-logout-link',
		url      : yithPosSettings.registerLogoutUrl,
		title    : __( 'Switch Register', 'yith-point-of-sale-for-woocommerce' ),
		show     : 'yith_pos_create_products' in yithPosSettings.user.posCaps
	}
] );

const CURRENT_SESSION_ID = yithPosSettings?.register?.session?.id ?? 0;
const CURRENT_USER_ID    = yithPosSettings?.user?.id ?? 0;

class PosHeader extends Component {

	constructor() {
		super( ...arguments );

		this.register = this.props.register;
		this.state    = {
			userItems   : this.getUserItems( { isLoading: true } ),
			audioEnabled: this.register.data.audioEnabled
		};

		this.dropdown_items = applyFilters( HEADER_MENU_ITEMS_FILTER, [
			{
				title       : __( 'Register Screen', 'yith-point-of-sale-for-woocommerce' ),
				icon        : 'receipt',
				internalLink: true,
				href        : "/",
				class       : "register-screen"
			},
			{
				title       : __( 'Order History', 'yith-point-of-sale-for-woocommerce' ),
				icon        : 'history',
				internalLink: true,
				href        : "/history",
				class       : "order-history"
			},
			{
				title       : __( "Today's profit", 'yith-point-of-sale-for-woocommerce' ),
				icon        : 'pie-chart',
				internalLink: false,
				href        : '',
				action      : 'registerProfit',
				class       : "register-profit"
			},
			{
				title       : __( 'Manage Cash', 'yith-point-of-sale-for-woocommerce' ),
				icon        : 'coin',
				internalLink: false,
				href        : '',
				action      : 'openCashInHand',
				class       : "manage-cash"
			},
			{
				title       : __( 'Close register', 'yith-point-of-sale-for-woocommerce' ),
				icon        : 'close-register',
				internalLink: false,
				action      : 'closeRegister',
				href        : '',
				class       : "register-close"
			}
		] );

		this.dropdown_title = { icon: 'animated-hamburger-menu', label: '' };

		this.user_title = {
			icon  : '',
			imgSrc: yithPosSettings.user.avatarURL,
			label : yithPosSettings.user.fullName
		};

	};

	getUserItems = ( { reports = {}, isLoading = false, hasReportError = false } ) => {
		const userItems = [];

		userItems.push(
			{
				title  : __( 'Login time', 'yith-point-of-sale-for-woocommerce' ),
				icon   : '',
				href   : '',
				content: this.props.register.getCurrentCashierLogin()
			}
		);

		if ( !hasReportError ) {
			userItems.push(
				{
					title    : __( 'Orders', 'yith-point-of-sale-for-woocommerce' ),
					icon     : '',
					href     : '',
					isLoading: isLoading,
					content  : reports?.orders_count?.value ?? 0
				}
			);

			userItems.push(
				{
					title    : __( 'Products', 'yith-point-of-sale-for-woocommerce' ),
					icon     : '',
					href     : '',
					isLoading: isLoading,
					content  : reports?.num_items_sold?.value ?? 0
				}
			);

			userItems.push(
				{
					title    : __( 'Total sales', 'yith-point-of-sale-for-woocommerce' ),
					icon     : '',
					href     : '',
					isLoading: isLoading,
					content  : formatCurrency( reports?.total_sales?.value ?? 0 )
				}
			);
		}

		userItems.push(
			{
				title       : __( 'Download CSV', 'yith-point-of-sale-for-woocommerce' ),
				icon        : 'download',
				internalLink: false,
				href        : '',
				action      : 'downloadCSV',
				class       : "download-csv"
			}
		);
		return userItems;
	};

	toggleFullscreen = () => {
		if ( !document.fullscreenElement ) {
			document.documentElement.requestFullscreen && document.documentElement.requestFullscreen();
		} else {
			document.exitFullscreen && document.exitFullscreen();
		}
	};

	toggleAudio = () => {
		const { audioEnabled } = this.state;
		this.props.register.toggleAudio();
		this.setState( { audioEnabled: !audioEnabled } );
	};

	showShadow = () => {
		document.getElementById( 'pos-shadow' ).classList.add( 'active' );
	};

	hideShadow = () => {
		document.getElementById( 'pos-shadow' ).classList.remove( 'active' );
	};

	handleHoverCashier = () => {
		this.showShadow();
		const apiOptions = {
			path  : addQueryArgs(
				`/yith-pos/v1/register-sessions/${CURRENT_SESSION_ID}/generate_reports`,
				{ cashier: CURRENT_USER_ID }
			),
			method: 'GET'
		};

		this.setState( { userItems: this.getUserItems( { isLoading: true, hasReportError: false } ) } )

		apiFetch( apiOptions ).then(
			generatedReports => {
				this.setState( { userItems: this.getUserItems( { reports: generatedReports, isLoading: false, hasReportError: false } ) } )
			},
			errorResponse => {
				this.setState( { userItems: this.getUserItems( { isLoading: false, hasReportError: true } ) } )
				console.log( errorResponse );
			}
		);
	};


	render() {
		const { registerProfit, openCashInHand, closeRegister, downloadCSV, logout } = this.props;
		const { userItems, audioEnabled }                                            = this.state;

		return (
			<div className="yith-pos-header">
				<DropDown id="main-view" items={this.dropdown_items} title={this.dropdown_title}
					onEnable={this.showShadow} onDisable={this.hideShadow} registerProfit={registerProfit}
					openCashInHand={openCashInHand} closeRegister={closeRegister}
				/>
				<div className="register-info">
					<i className="yith-pos-icon-store"/>
					<span><strong>{__( 'Store:', 'yith-point-of-sale-for-woocommerce' )}</strong> {yithPosSettings.store.name}</span>
					<span><strong>{__( 'Register:', 'yith-point-of-sale-for-woocommerce' )}</strong> {yithPosSettings.register.name}</span>

					{headerLinks.map( ( headerLink, index ) => {
						const show = typeof headerLink.show !== 'undefined' ? headerLink.show : true;
						return show && <a key={index} className={headerLink.className} href={headerLink.url}>{headerLink.title}</a>;
					} )}
				</div>


				{yithPosSettings.audioEnabled === "yes" && <div className="audio-player" onClick={this.toggleAudio}>
					<Icon icon={audioEnabled ? 'notifications' : 'notifications-off'}/>
				</div>
				}

				{!!document.documentElement.requestFullscreen && <div className="full-screen" onClick={this.toggleFullscreen}>
					<Icon icon="zoom"/>
				</div>}
				<DropDown id="user-view" items={userItems} title={this.user_title}
					onEnable={this.handleHoverCashier} onDisable={this.hideShadow} downloadCSV={downloadCSV}/>
				<div className="logout">
					<a href="#" onClick={logout}
						title={__( 'Logout', 'yith-point-of-sale-for-woocommerce' )}>
						<Icon icon="exit-to-app"/>
						{__( 'Logout', 'yith-point-of-sale-for-woocommerce' )}
					</a>
				</div>
			</div>
		);
	}

}

export default PosHeader;
