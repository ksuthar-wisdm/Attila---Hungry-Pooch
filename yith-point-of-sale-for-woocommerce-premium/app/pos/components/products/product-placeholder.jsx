import React, { Component } from 'react';

class ProductPlaceholder extends Component {
    render() {
        return (
            <div className="product product-placeholder">
                <div className='product-image'/>
                <div className='product-heading'>
                    <div className='product-title'/>
                    <div className='product-price'/>
                </div>
            </div>
        );
    }

}

export default ProductPlaceholder;
