import React, { Component } from 'react';

class ProductListFilters extends Component {

    constructor() {
        super( ...arguments );

        this.state = {
            filter: 'all'
        };

    }

    updateFilter = ( filter, callback ) => {
        this.setState( { filter } );
        callback( filter );
    };

    render() {
        const { filters, onFilter } = this.props;
        const { filter }            = this.state;
        return (
            <div className="yith-pos-product-list__filters">
                {filters.map( ( _filter, _index ) => {
                    const className = _filter.key === filter ? 'active' : '';
                    return (
                        <span key={_index} className={className}
                              onClick={() => {
                                  this.updateFilter( _filter.key, onFilter )
                              }}>{_filter.label}</span>
                    )
                } )}
            </div>
        );
    }

}

export default ProductListFilters;
