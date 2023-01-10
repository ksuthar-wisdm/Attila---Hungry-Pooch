import { applyFilters } from '@wordpress/hooks';

export default class SimpleObject {

	type = 'simple_object';

	constructor( data ) {
		this.data = data instanceof Object ? data : {};
	}

	getProp = ( prop, def = undefined ) => {
		const FILTER = `yith_pos_get_${this.type}_${prop}`;
		const value  = prop in this.data ? this.data[ prop ] : def;
		return applyFilters( FILTER, value, this );
	};

	getId = () => {
		this.getProp( 'id', 0 );
	};

	setProp = ( prop, value ) => {
		this.data[ prop ] = value;
	}
}