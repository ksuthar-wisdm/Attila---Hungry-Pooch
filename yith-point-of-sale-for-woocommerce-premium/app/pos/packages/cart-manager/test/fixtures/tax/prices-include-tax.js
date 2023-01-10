export default Object.assign( {}, {
    enabled              : true,
    priceIncludesTax     : true,
    showPriceIncludingTax: false,
    classesAndRates      : {
        ''            : [
            { rate: 20, label: 'VAT', shipping: 'yes', compound: 'no' },
            { rate: 5, label: 'VAT', shipping: 'yes', compound: 'yes' }
        ],
        'reduced-rate': [{ rate: 10, label: 'VAT', shipping: 'yes', compound: 'no' }],
        'zero-rate'   : []
    },
    classes              : ['reduced-rate', 'zero-rate', ''],
    classesLabels        : ['Reduced Rate', 'Zero Rate', ''],
    roundAtSubtotal      : false
} );