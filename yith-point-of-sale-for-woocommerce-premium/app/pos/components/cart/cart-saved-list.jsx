import React     from 'react';
import CartSaved from "./cart-saved";

const CartSavedList = ( props ) => {

    const {carts, savedCartAction, onEditing, editing, editSavedCartNote } = props;

    const sortedCarts = carts;
    sortedCarts.sort( ( a, b ) => ( parseInt( a.id ) > parseInt( b.id ) ) ? 1 : -1 );
    return(
        <div className='yith-pos-cart__savedcarts'>
            {
                sortedCarts.length > 0 && sortedCarts.map( (cart , index) =>{
                    const edit = editing === cart.id;
                    return (<CartSaved key={`saved-cart-${index}`} cart={cart} savedCartAction ={savedCartAction } onEditing={onEditing} editing={edit} editSavedCartNote={ editSavedCartNote } /> );
                })
            }
        </div>

    )
}

export default CartSavedList;

