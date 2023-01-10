export function isReceiptEnabled() {
	return !!yithPosSettings.receipt;
}

export function isMultiStockEnabled() {
	return 'yes' === yithPosSettings.multistockEnabled;
}

export function shouldShowStockOnPos() {
	return 'yes' === yithPosSettings.showStockOnPOS;
}

export function closeModalsWhenClickingOnBackground() {
	return yithPosSettings.closeModalsWhenClickingOnBackground === 'yes';
}

export function downloadRegisterReports() {
	const { downloadReportsUrl } = yithPosSettings?.register?.session;

	if ( downloadReportsUrl ) {
		location.href = downloadReportsUrl;
	}
}

export function downloadCashierReports() {
	const { downloadCashierReportsUrl } = yithPosSettings?.register?.session;

	if ( downloadCashierReportsUrl ) {
		location.href = downloadCashierReportsUrl;
	}
}

/**
 * Retrieve the label for the VAT field.
 * @returns {string}
 */
export function getVatFieldLabel() {
	const { vatFieldLabel } = yithPosSettings;

	return vatFieldLabel ?? '';
}