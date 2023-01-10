import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiFetch                          from '@wordpress/api-fetch';
import { useDispatch, useSelector }      from 'react-redux';
import { addQueryArgs }                  from '@wordpress/url';
import { useCallback }                   from 'react';

const initialState = {
	items      : [],
	total_items: 0,
	total_pages: 0,
	page       : 0,
	status     : 'idle',
	error      : null
};

const parseResponse = ( response, shouldParseResponse = true ) => {
	if ( shouldParseResponse ) {
		if ( response.status === 204 ) {
			return null;
		}

		return response.json ? response.json() : Promise.reject( response );
	}

	return response;
};

const _fetchProducts = async ( query = {} ) => {
	const defaults = {
		page            : 1,
		per_page        : 20,
		status          : 'publish',
		lang            : yithPosSettings.language,
		yith_pos_request: 'get-products',
		yith_pos_store  : yithPosSettings.store.id
	};

	const { query_options: registerQueryOptions } = yithPosSettings.register;
	const requestQuery                            = { ...defaults, ...registerQueryOptions, ...query };

	const apiOptions      = {
		path : addQueryArgs( `wc/v3/products`, requestQuery ),
		parse: false
	};
	const responsePromise = apiFetch( apiOptions );

	return Promise.resolve( responsePromise ).then(
		response => {
			return Promise.resolve( parseResponse( response ) ).then(
				products => {
					const purchasableProducts = products.filter( ( product ) => product.purchasable );

					return {
						items      : purchasableProducts,
						total_items: response.headers.get( 'X-WP-Total' ),
						total_pages: response.headers.get( 'X-WP-TotalPages' ),
						page       : requestQuery.page
					}
				}
			)
		}
	);
};

const fetchAdditionalProducts = createAsyncThunk( 'products/fetchAdditionalProducts', _fetchProducts );
const fetchProducts           = createAsyncThunk( 'products/fetchProducts', _fetchProducts );

const productsSlice = createSlice(
	{
		name         : 'products',
		initialState,
		reducers     : {
			productUpdated: ( state, action ) => {
				const newProduct = action.payload;
				const idx        = state.items.findIndex( _ => _.id === newProduct.id );
				if ( idx > -1 ) {
					state.items[ idx ] = { ...state.items[ idx ], ...newProduct };
				}
			}
		},
		extraReducers: builder => {
			builder
				.addCase( fetchProducts.pending, ( state, action ) => {
					state.status = 'loading';
					state.page   = 0;
				} )
				.addCase( fetchProducts.fulfilled, ( state, action ) => {
					state.items       = action.payload.items;
					state.total_items = action.payload.total_items;
					state.total_pages = action.payload.total_pages;
					state.page        = action.payload.page;

					state.status = 'idle';
				} )
				.addCase( fetchAdditionalProducts.pending, ( state, action ) => {
					state.status = 'loading';
				} )
				.addCase( fetchAdditionalProducts.fulfilled, ( state, action ) => {
					state.items       = [...state.items, ...action.payload.items];
					state.total_items = action.payload.total_items;
					state.total_pages = action.payload.total_pages;
					state.page        = action.payload.page;

					state.status = 'idle';
				} )
		}
	}
);

export const { productUpdated } = productsSlice.actions;

export const selectAllProducts = state => state.products.items;
export const selectStatus      = state => state.products.status;
export const selectError       = state => state.products.error;
export const selectTotalItems  = state => state.products.total_items;
export const selectTotalPages  = state => state.products.total_pages;
export const selectPage        = state => state.products.page;

/**
 * Custom Hooks
 */

export const useProducts = () => {
	const dispatch       = useDispatch();
	const products       = useSelector( selectAllProducts );
	const requestStatus  = useSelector( selectStatus );
	const isLoading      = 'loading' === requestStatus;
	const page           = useSelector( selectPage );
	const totalPages     = useSelector( selectTotalPages );
	const isFirstLoading = isLoading && 0 === page;

	const fetchAll = useCallback( ( query = {} ) => {
		dispatch( fetchProducts( query ) );
	}, [] );

	const fetchNextPage = useCallback( ( query = {} ) => {
		dispatch( fetchAdditionalProducts( { ...query, page: ( page + 1 ) } ) );
	}, [page] );


	return {
		products,
		isLoading,
		isFirstLoading,
		page,
		totalPages,
		fetchNextPage,
		fetchProducts: fetchAll
	}
};

export default productsSlice.reducer