import React, { Component } from 'react';

import ProductSearch        from "./products/product-search";
import Calculator from '../components/common/calculator';


class ProductSearchSection extends Component {

    constructor() {
        super( ...arguments );

        this.controlledModalElement = React.createRef();

    }



    render() {
        const {onClickResult, scannerActive} = this.props;
        return (
            <div className="yith-pos-product-list__search_section">
                <div className="yith-pos-product-list__logo"><img src={yithPosSettings.logoUrl} /></div>
                <div className="yith-pos-product-list__search">
                    <ProductSearch scannerActive={scannerActive} onClickResult={onClickResult} autofocus="true"/>
                </div>
                <div className="yith-pos-product-list__buttons">
                    <Calculator />
                </div>
            </div>
        );
    }
}
export default ProductSearchSection;
