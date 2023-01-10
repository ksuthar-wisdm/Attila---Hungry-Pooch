/** global yithPosSettings */
import React            from 'react';
import _                from 'lodash';

import ajax                                                 from '../ajax';
import storage                                              from '../storage';
import { formatDate, getDateFromString, getDateTimeFormat } from '../date';

export class RegisterManager {

	constructor() {
		const audioEnabled                     = storage.get( 'audioEnabled', true );
		const { register, user, assetsUrl }    = yithPosSettings;
		const { session }                      = register;
		const { cash_in_hand, formatted_open } = session;

		this.data = {
			id                      : register.id,
			sessionId               : session.id,
			wasClosed               : ( !cash_in_hand.length ),
			cashInHand              : cash_in_hand,
			open                    : formatted_open,
			cashiers                : session.cashiers,
			currentCashier          : user.id,
			note                    : '',
			audioEnabled            : audioEnabled
		};

		this.beep     = new Audio();
		this.beep.src = assetsUrl + '/audio/beep.mp3';
	}

	playSound() {
		const { audioEnabled } = this.data;
		if ( yithPosSettings.audioEnabled === 'yes' && audioEnabled ) {
			this.beep.currentTime = 0;
			this.beep.play();
		}
	}

	toggleAudio() {
		this.data.audioEnabled = !this.data.audioEnabled;
		storage.set( 'audioEnabled', this.data.audioEnabled );
	}

	getCurrentCashierLogin() {
		const stats = this.getCurrentCashierStats();

		return formatDate( getDateTimeFormat(), getDateFromString( stats.login ) );
	};

	getCurrentCashierStats() {
		const { currentCashier, cashiers } = this.data;
		if ( cashiers.length > 0 ) {
			const cashierInfo = cashiers.filter( ( user ) => user.id === currentCashier );
			if ( !_.isEmpty( cashierInfo ) ) {
				return cashierInfo[ cashierInfo.length - 1 ];
			}
		}

		return false;
	};

	updateRegisterSession( type, data = {}, callback ) {
		const ajaxData = {
			...data,
			sessionID  : this.data.sessionId,
			action     : 'yith_pos_update_register_session',
			type       : type,
			_ajax_nonce: yithPosSettings.register.session.nonce
		};


		ajax( ajaxData ).then( response => {
			if ( typeof callback !== 'undefined' ) {
				callback( response );
			}
		} )
			.catch( error => {
				console.log( { error } );
			} );
	}

	addCashInHand( amount, reason = '' ) {
		const { currentCashier } = this.data;
		const cashInHand         = {
			amount   : amount,
			cashier  : currentCashier,
			reason   : reason,
			timestamp: Math.floor( Date.now() / 1000 )
		};

		this.data.cashInHand.push( cashInHand );
		this.data.wasClosed = false;
		this.updateRegisterSession( 'add_cash_in_hand', { cashInHand } );
	}

	getCashInHandAmount() {
		const { cashInHand } = this.data;
		let total            = 0;
		if ( !_.isNull( cashInHand ) && cashInHand.length > 0 ) {
			cashInHand.forEach( ( c ) => {
									if ( !isNaN( c.amount ) ) {
										total += parseFloat( c.amount )
									}
								}
			);
		}

		return total;
	}

	getOpeningTime() {
		const { open } = this.data;
		return formatDate( getDateTimeFormat(), getDateFromString( open ) );
	}

	getClosingTime() {
		// Not using offset, since it'll get the local time from the browser.
		return formatDate( getDateTimeFormat() );
	}

	getCashiers() {
		const { cashiers } = this.data;
		let cashierNames   = [];
		let cashierIds     = [];

		if ( cashiers.length > 0 ) {
			cashiers.forEach( ( user ) => {
				if ( ( cashierIds.indexOf( user.id ) < 0 ) ) {
					cashierNames.push( user.name );
					cashierIds.push( user.id );
				}
			} );
		}
		return !_.isEmpty( cashierNames ) ? cashierNames.join( ', ' ) : '';
	}

	closeRegister( note = '' ) {
		this.data.note = note;
		this.updateRegisterSession( 'close_register', { note }, () => {
			window.location.href = yithPosSettings.closeRegisterUrl;
		} );
	}

}