const cartItems = {
    'default': [
        { qty: 1, product: { price: 5 } },
        { qty: 1, product: { price: 15, tax_status: 'none' } },
        { qty: 4, product: { price: 4.95, tax_class: 'reduced-rate' } },
        { qty: 3, product: { price: 3.24 } }
    ],
    'big'    : [
        { qty: 1, product: { price: 3.17 } },
        { qty: 1, product: { price: 9.53, tax_status: 'none' } },
        { qty: 4, product: { price: 4.97, tax_class: 'reduced-rate' } },
        { qty: 3, product: { price: 3.23 } },
        { qty: 8, product: { price: 7.17 } },
        { qty: 4, product: { price: 7.01 } },
        { qty: 7, product: { price: 6.13 } }
    ]
};

export default cartItems;