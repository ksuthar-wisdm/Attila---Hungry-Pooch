import React  from 'react';

import Form                from '../common/form';
import { i18n_cart_label as labels } from './config';

class CartAddNote extends Form {

    constructor() {
        super( ...arguments );

        this.state = {
            data: {
                note: "",
            },
            error: {}
        };
    }

    componentDidMount() {
        const {currentNote} = this.props;
        this.setState( { data: {
            note:currentNote
        } })
    }

    doSubmit = () => {
        this.props.saveCartNote( this.state.data.note );
    };

    render() {

        return (
            <div>
                <form onSubmit={ this.handleSubmit } className="cart-add-note">
                    { this.renderTextArea( 'note', labels.addNote ) }
                    { this.renderButton( labels.saveNote ) }
                </form>
            </div>
        );
    }
}

export default CartAddNote;