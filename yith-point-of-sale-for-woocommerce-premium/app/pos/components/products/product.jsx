/** global yithPosSettings */
import React, { Component } from 'react';
import classNames           from 'classnames';

import { getProductImageUrl, getProductImageAlt } from '../../packages/products';
import { getProductPriceHTMLToDisplayInShop }     from '../../packages/taxes';
import ProductStockBadge                          from './product-stock-badge';

class Product extends Component {

	render() {
		const { product, addCartItem, ...extraProps } = this.props;
		const imageUrl                                = getProductImageUrl( product );
		const imageAlt                                = getProductImageAlt( product );

		const classes = classNames(
			'product',
			`product-${product.id}`,
			product?.type,
			{
				'out-of-stock': 'variable' !== product.type && 'outofstock' === product.stock_status
			}
		)

		return (
			<div {...extraProps} className={classes} onClick={() => {
				( product.type === 'variable' || product.stock_status !== 'outofstock' ) && addCartItem();
			}}>
				<ProductStockBadge product={product}/>
				<div style={{ backgroundImage: `url(${imageUrl})` }} alt={imageAlt} className="product-image"/>
				<div className="product-heading">
					<div className="product-title">{product.name}</div>
					<div className="product-price" dangerouslySetInnerHTML={{ __html: getProductPriceHTMLToDisplayInShop( product ) }}/>
				</div>
			</div>
		);
	}
}

export default Product;
