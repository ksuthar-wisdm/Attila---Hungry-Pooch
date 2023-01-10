export class CartCouponError extends Error {
    constructor( ...params ) {
        super( ...params );

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if ( Error.captureStackTrace ) {
            Error.captureStackTrace( this, CartCouponError );
        }
    }
}

export class PosError extends Error {
    constructor( ...params ) {
        super( ...params );

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if ( Error.captureStackTrace ) {
            Error.captureStackTrace( this, PosError );
        }
    }
}