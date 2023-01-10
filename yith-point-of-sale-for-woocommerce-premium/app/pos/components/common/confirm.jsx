import React, { Component, Fragment } from 'react';
import { __ }                         from '@wordpress/i18n';
import { noop }                       from 'lodash';

class Confirm extends Component {
    render() {
        const { message, onConfirm, onCancel, confirmText, cancelText } = this.props;
        return (
            <div className='confirm'>
                <div className="confirm__message">{message}</div>
                {!!confirmText.length && <div className="confirm__confirm" onClick={onConfirm}>{confirmText}</div>}
                {!!cancelText.length && <div className="confirm__cancel" onClick={onCancel}>{cancelText}</div>}
            </div>
        )
    }
}

Confirm.defaultProps = {
    message    : __( 'Are you sure?', 'yith-point-of-sale-for-woocommerce' ),
    confirmText: __( 'Yes', 'yith-point-of-sale-for-woocommerce' ),
    cancelText : __( 'Cancel', 'yith-point-of-sale-for-woocommerce' ),
    onConfirm  : noop,
    onCancel   : noop
};

export default Confirm;
