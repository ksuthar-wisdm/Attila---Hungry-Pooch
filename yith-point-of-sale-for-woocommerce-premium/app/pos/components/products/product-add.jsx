import React, { Component } from 'react';

class ProductAdd extends Component {
    render() {
        return (
            <div className="product product-add" onClick={this.props.onClick}>
                <i className="yith-pos-icon-add" />
            </div>
        );
    }

}

export default ProductAdd;
