/** global yithPosSettings */

import { addQueryArgs } from "@wordpress/url";
import apiFetch         from '@wordpress/api-fetch';

const categoriesPath = '/wc/v3/products/categories';
const _query = {
    per_page  : 9,
    hide_empty: false,
    lang      : yithPosSettings.language
};

export const searchCategories = ( queryString = '' ) => {
    let query = Object.assign( {}, _query, yithPosSettings.register.category_query_options);
    if ( queryString !== '' ) {
        query.search = queryString;
    }

    return apiFetch( {

        path: addQueryArgs( categoriesPath, query )
    } ).then( ( categories ) => {

        let categoryList = [];
        categories.map( ( category ) => {
            categoryList.push( { value: String( category.id ), label: category.name } );
        } );

        return categoryList;
    } );
};
