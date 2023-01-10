import React, { Component } from 'react';

class OrderDetailsLineItem extends Component {

    render() {
        const { id, name, total, type } = this.props;

        return (
            <div className={`yith-pos-order-details__line-item yith-pos-order-details__line-item--${type}`}
                 data-id={id}>
                <div className='yith-pos-order-details__item-row'>
                    <div className='name'>{name}</div>
                    <div className='total'>{total}</div>
                </div>
            </div>
        );
    }

}

export default OrderDetailsLineItem;
 