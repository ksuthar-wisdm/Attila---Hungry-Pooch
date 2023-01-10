export const createFee = function ( amount = 0, percentage = false ) {
    return {
        type      : 'fee',
        amount    : amount,
        percentage: percentage
    }
};

export const createDiscount = function ( amount = 0, percentage = false ) {
    return {
        type      : 'discount',
        amount    : amount,
        percentage: percentage
    }
};