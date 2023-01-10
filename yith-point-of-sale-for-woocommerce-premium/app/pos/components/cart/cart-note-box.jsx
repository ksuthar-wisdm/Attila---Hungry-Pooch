import React from 'react';

const CartNoteBox = ( props ) => {

    const {editCartNote, noteTitle, note } = props;

    return(

        note !== '' && (
        <div className="cart-note-box" onClick={ editCartNote }>
            <i className="yith-pos-icon-item-note"></i>
            <div className="note-content"><h5>{ noteTitle }</h5> { note }</div>
        </div>)
    );
}

export default CartNoteBox;

