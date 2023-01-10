module.exports = function ( api ) {
    api.cache( true );

    return {
        presets: [
            '@babel/preset-env',
            '@babel/react', { 'plugins': ['@babel/plugin-proposal-class-properties'] }
        ],
        plugins: [
            ["@babel/transform-runtime"]
        ]
        /*plugins: [
            [
                '@wordpress/babel-plugin-makepot',
                {
                    output: 'languages/yith-point-of-sale-for-woocommerce1.pot',
                },
            ],
        ],*/

    };
};
