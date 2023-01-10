import React, { Component } from 'react';
import { addQueryArgs }     from '@wordpress/url';
import apiFetch             from '@wordpress/api-fetch';

import ProductCategory            from './product-category';
import ProductCategoryPlaceholder from './product-category-placeholder';
import ProductAdd                 from './product-add';

class ProductCategoryList extends Component {

    constructor() {
        super( ...arguments );
        this.perPage = 9;
        this.path    = 'wc/v3/products/categories';

        this._query = {
            per_page  : this.perPage,
            hide_empty: true,
            lang      : yithPosSettings.language
        };

        this.state = {
            items          : [],
            loading        : true,
            loadingNextPage: false,
            allLoaded      : false,
            page           : 1
        };

        this.references = {
            listContainer: React.createRef()
        }
    }

    componentDidMount() {
        this.loadItems();
    }

    handleScroll = () => {
        const element = this.references.listContainer.current;

        if ( ( ( element.scrollHeight - element.scrollTop ) / 2 < element.clientHeight ) || element.scrollHeight === element.clientHeight ) {
            this.loadNextPage();
        }
    };

    getQuery = () => {
        return Object.assign( {}, this._query, yithPosSettings.register.category_query_options );
    };

    loadItems = () => {
        this.setState( { loading: true, page: 1, allLoaded: false } );
        apiFetch( {
                      path: addQueryArgs( this.path, this.getQuery() )
                  } ).then( ( items ) => {
            if ( items ) {
                this.setState( { items: items, loading: false } );
            }

            if ( items.length < this.perPage ) {
                this.setState( { allLoaded: true } );
            } else {
                this.handleScroll();
            }
        } );
    };

    loadNextPage = () => {
        const { page, loadingNextPage, items } = this.state;
        if ( !loadingNextPage ) {
            this.setState( { loadingNextPage: true } );

            let query      = this.getQuery();
            query.per_page = this.perPage;
            query.offset   = page * this.perPage;

            apiFetch( {
                          path: addQueryArgs( this.path, query )
                      } ).then( ( newItems ) => {
                if ( newItems ) {
                    this.setState( { items: [...items, ...newItems], loadingNextPage: false, page: page + 1 } );
                }

                if ( newItems.length < this.perPage ) {
                    this.setState( { allLoaded: true, loadingNextPage: false } );
                }
            } );
        }
    };

    render() {
        const { items, loading, loadingNextPage, allLoaded } = this.state;
        const { onSelect, addProductHandler }                                = this.props;

        const placeholders = [...Array( 6 ).keys()].map( ( placeholder, index ) => {
            return <ProductCategoryPlaceholder key={index}/>
        } );

        return (
            <div className="yith-pos-product-category-list" ref={this.references.listContainer}>
                <div className='yith-pos-product-category-list__list' onScroll={this.handleScroll}>
                    {
                        loading ?
                        placeholders :
                        [
                           
                            items.map( ( category ) => {
                            return (
                                <ProductCategory key={category.id} category={category} onClick={() => {
                                    onSelect( category.id );
                                }}/>
                            )
                        } ),
                         loadingNextPage && !allLoaded && placeholders
                        ]
                    }
                </div>
            </div>
        );
    }

}

export default ProductCategoryList;
