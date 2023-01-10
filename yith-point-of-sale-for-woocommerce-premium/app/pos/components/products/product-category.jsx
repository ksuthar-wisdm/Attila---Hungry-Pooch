/** global yithPosSettings */
import React, { Component }                       from 'react';
import { getProductImageUrl, getProductImageAlt } from '../../packages/products';

class ProductCategory extends Component {
    render() {
        const { category, onClick, ...extraProps } = this.props;
        const imageUrl                             = getProductImageUrl( category );
        const imageAlt                             = getProductImageAlt( category );

        return (
            <div {...extraProps} className={"product-cat product-cat-" + category.id} onClick={() => {
                onClick();
            }}>
                <div style={{backgroundImage: `url(${imageUrl})`}} alt={ imageAlt } className='product-cat-image'/>
                <div className='product-cat-heading'>
                    <div className='product-cat-title' dangerouslySetInnerHTML={{ __html: category.name }}/>
                </div>
            </div>
        );
    }

}

export default ProductCategory;
