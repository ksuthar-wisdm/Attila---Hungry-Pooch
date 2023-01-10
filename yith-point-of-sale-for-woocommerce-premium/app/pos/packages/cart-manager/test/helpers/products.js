let productCounter   = 0;
const defaultProduct = {
    id          : 0,
    name        : 'Dummy Product',
    type        : 'simple',
    price       : 10,
    sku         : 'DUMMY SKU',
    manage_stock: false,
    tax_status  : 'taxable',
    tax_class   : '',
    downloadable: false,
    virtual     : false,
    stock_status: 'instock'
};

export const createSimpleProduct = function ( params = {} ) {
    productCounter++;
    return Object.assign( {}, defaultProduct, { id: productCounter }, params );
};