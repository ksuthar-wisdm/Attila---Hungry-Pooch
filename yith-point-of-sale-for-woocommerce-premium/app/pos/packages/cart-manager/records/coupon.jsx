const defaults = {
	id                         : 0,
	code                       : '',
	amount                     : '',
	date_created               : '',
	date_created_gmt           : '',
	date_modified              : '',
	date_modified_gmt          : '',
	discount_type              : "percent",
	description                : '',
	date_expires               : null,
	date_expires_gmt           : null,
	usage_count                : 0,
	individual_use             : false,
	product_ids                : [],
	excluded_product_ids       : [],
	usage_limit                : null,
	usage_limit_per_user       : null,
	limit_usage_to_x_items     : null,
	free_shipping              : false,
	product_categories         : [],
	excluded_product_categories: [],
	exclude_sale_items         : false,
	minimum_amount             : '',
	maximum_amount             : '',
	email_restrictions         : [],
	used_by                    : [],
	meta_data                  : []
};

export const getCoupon = function ( params = {} ) {
	return Object.assign( {}, defaults, params );
};