import React, { Fragment } from 'react';
import { noop }            from "lodash";
import classNames          from "classnames";
import { __ }              from '@wordpress/i18n';

import Form                        from "../common/form";
import { downloadRegisterReports } from '../../packages/settings';

import RegisterSessionReports from './register-session-reports';

class RegisterClose extends Form {

	constructor() {
		super( ...arguments );

		this.state = {
			data : {
				note   : '',
				closing: false
			},
			error: {}
		};

	}

	downloadReport = () => {
		downloadRegisterReports();
	};

	closeRegister = () => {
		const { register } = this.props;
		const { note }     = this.state.data;

		this.setState( { closing: true } );

		register.closeRegister( note );

	};

	render() {
		const { register, onUndo } = this.props;
		const { closing }          = this.state;

		const closeButtonClass = classNames( 'register-close-button', { 'is-loading--left': !!closing } );

		return (
			<Fragment>
				<RegisterSessionReports registerManager={register} isClosing/>
				{yithPosSettings.register.closing_report_note_enabled === 'yes' && this.renderTextArea( 'note', __( 'Add a note (optional)', 'yith-point-of-sale-for-woocommerce' ) )}
				<div className="close-register-actions">
					{this.renderButton( __( 'Download Report', 'yith-point-of-sale-for-woocommerce' ), { onClick: this.downloadReport, variant: 'dark', size: 'big', className: 'register-download-report-button', fullWidth: false } )}
					{this.renderButton( __( 'Back', 'yith-point-of-sale-for-woocommerce' ), { onClick: onUndo, variant: 'tertiary', size: 'big', className: 'register-back-button' } )}
					{this.renderButton( __( 'Close Register', 'yith-point-of-sale-for-woocommerce' ), { onClick: !closing ? this.closeRegister : noop, size: 'big', className: closeButtonClass, isLoading: !!closing } )}

				</div>
			</Fragment>
		);
	}
}

export default RegisterClose;