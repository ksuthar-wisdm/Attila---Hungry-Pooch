import { _x, __ }                              from '@wordpress/i18n';
import React, { useEffect, useMemo, useState } from 'react';

import OrderReceiptPrint        from './order-receipt-print';
import { isReceiptEnabled }     from '../../packages/settings';
import { isGiftReceiptEnabled } from '../../packages/objects/receipt';
import Link                     from '../../packages/components/link';
import Button                   from '../../packages/components/button';
import { applyFilters }         from '@wordpress/hooks';

// translators: %s is the 'print gift receipt' link
const OR_TEXT       = _x( 'or %s', 'Print gift receipt', 'yith-point-of-sale-for-woocommerce' );
const OR_TEXT_PARTS = OR_TEXT.split( '%s' );

const TIMEOUT = applyFilters( 'yith_pos_order_receipt_print_timeout', 100 );

export default function OrderReceiptPrintControl( { order } ) {
	const [isGift, setIsGift]         = useState( false );
	const [isPrinting, setIsPrinting] = useState( false );
	const isGiftEnabled               = useMemo( () => isReceiptEnabled() && isGiftReceiptEnabled(), [] );
	if ( !isReceiptEnabled() ) {
		return null;
	}

	useEffect( () => {
		if ( isPrinting ) {
			setTimeout( () => {
				window.print();
				setIsPrinting( false );
			}, TIMEOUT );
		}
	}, [isPrinting] );

	const handlePrint = ( giftReceipt = false ) => {
		setIsGift( !!giftReceipt );
		setIsPrinting( true );
	};

	return <>
		<div className="yith-pos-order-receipt-print-control">
			<Button variant="dark" size="big" onClick={() => handlePrint( false )}>{__( 'Print Receipt', 'yith-point-of-sale-for-woocommerce' )}</Button>
			{isGiftEnabled && <div className="yith-pos-order-receipt-print-control__gift-print">
				{OR_TEXT_PARTS[ 0 ]}
				<Link onClick={() => handlePrint( true )}>
					{__( 'print gift receipt', 'yith-point-of-sale-for-woocommerce' )}
				</Link>
				{OR_TEXT_PARTS[ 1 ]}
			</div>}
		</div>
		<OrderReceiptPrint order={order} isGift={isGiftEnabled && isGift} />
	</>
}