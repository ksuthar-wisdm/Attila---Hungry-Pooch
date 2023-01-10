import React                         from 'react';
import { i18n_cart_label as labels } from "./config";
import Form                          from "../common/form";

class CartSaveAddBox extends Form {

	constructor() {
		super( ...arguments );

		this.state = {
			data : {
				reasonNote: ""
			},
			error: {}
		};
	}

	doSubmit = () => {
		this.props.onSave( this.state.data.reasonNote );
	};

	render() {

		return (
			<form onSubmit={this.handleSubmit} className="cart-save">
				{this.renderTextArea( 'reasonNote', labels.reasonCartDescription )}
				{this.renderButton( labels.reasonCartSaveSubmit, { variant: 'secondary', className: 'suspend-and-save-cart-button' } )}
			</form>
		)
	}

}

export default CartSaveAddBox;


