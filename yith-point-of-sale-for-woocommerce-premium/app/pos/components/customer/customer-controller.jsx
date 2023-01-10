import { useState } from 'react';

import { __, _x, sprintf } from '@wordpress/i18n';
import { applyFilters }    from '@wordpress/hooks';

import ListSelector            from '../../packages/components/list-selector';
import Modal                   from '../../packages/components/modal';
import { userCan }             from '../../packages/user';
import Customer                from '../../packages/cart-manager/records/customer';
import { getCustomerFullName } from '../../packages/customers';
import Link                    from '../../packages/components/link';
import Icon                    from '../../packages/components/icon';
import CustomerDetails         from './customer-details';
import CustomerForm            from './customer-form';
import { tokenPrintf }         from '../../packages/utils';

const buttons = [
	{
		key  : 'guest',
		label: __( 'Proceed as guest', 'yith-point-of-sale-for-woocommerce' ),
		icon : 'guest-user'
	},
	{
		key  : 'load-customer',
		label: __( 'Load a customer profile', 'yith-point-of-sale-for-woocommerce' ),
		icon : 'customer'
	}
];

if ( userCan( 'yith_pos_create_users' ) ) {
	buttons.push(
		{
			key  : 'new-customer',
			label: __( 'Create new customer profile', 'yith-point-of-sale-for-woocommerce' ),
			icon : 'create-user'
		}
	);
}

const defaultNewCustomerData = applyFilters( 'yith_pos_default_new_customer_data', {} );

export default function CustomerController( { customer: currentCustomer, onClose, onChange } ) {
	const isGuest = currentCustomer.id === 0;

	/**
	 * The "view" to show.
	 * Possible values are:
	 * - type:first step to choose how to proceed
	 * - load-customer: load a specific customer
	 * - current-customer: see the current customer
	 * - edit-customer: edit a specific customer
	 * - new-customer: create new customer
	 */
	const [view, setView]                       = useState( isGuest ? 'type' : 'current-customer' );
	const [editingCustomer, setEditingCustomer] = useState( {} );
	const [loadedCustomer, setLoadedCustomer]   = useState( currentCustomer );
	const isEditingCurrentCustomer              = editingCustomer?.id && editingCustomer?.id === currentCustomer.id;

	const handleReset = () => {
		setView( 'type' );
		setLoadedCustomer( Customer() );
		onChange( Customer() ); // Set customer to be guest.
	};

	const changeAndClose = ( newCustomer ) => {
		onChange( Customer( newCustomer ) );
		onClose();
	}

	const handleCustomerEdit = ( customerToEdit ) => {
		setEditingCustomer( customerToEdit );
		setView( 'edit-customer' );
	}

	let viewComponent = null;
	let modalTitle    = __( 'Customer profile', 'yith-point-of-sale-for-woocommerce' );
	switch ( view ) {
		case 'load-customer':
			viewComponent = <CustomerDetails
				customer={loadedCustomer}
				onSelect={_ => setLoadedCustomer( _ )}
				onClear={handleReset}
				onConfirm={changeAndClose}
				onEdit={handleCustomerEdit}
				mode="load"
				notFoundRender={() => <Link variant="bold" layout="inline-flex" onClick={() => setView( 'new-customer' )}>
					{_x( 'Create a new customer profile', 'Action', 'yith-point-of-sale-for-woocommerce' )}
					<Icon icon="arrow_right"/>
				</Link>}
				currentCustomerFooterRender={() => <div className="customer-controller__profile-alternatives">
					{tokenPrintf(
						__( 'You can also %s or %s', 'yith-point-of-sale-for-woocommerce' ),
						<Link variant="bold" onClick={() => setView( 'new-customer' )}>
							{_x( 'Create a new customer profile', 'Action', 'yith-point-of-sale-for-woocommerce' )}
						</Link>,
						<Link variant="bold" onClick={() => changeAndClose( {} )}>
							{_x( 'Proceed as guest', 'Action', 'yith-point-of-sale-for-woocommerce' )}
						</Link>
					)}
				</div>
				}
			/>
			modalTitle    = __( 'Load a customer profile', 'yith-point-of-sale-for-woocommerce' );
			break;
		case 'current-customer':
			viewComponent = <CustomerDetails customer={currentCustomer} onClear={handleReset} onConfirm={changeAndClose} onEdit={handleCustomerEdit} mode="edit"/>
			modalTitle    = __( 'Current customer profile', 'yith-point-of-sale-for-woocommerce' );
			break;
		case 'edit-customer':
			viewComponent = <CustomerForm customer={editingCustomer} onSave={( newCustomer ) => {
				if ( isEditingCurrentCustomer ) {
					onChange( Customer( newCustomer ) );
					setView( 'current-customer' );
				} else {
					setLoadedCustomer( Customer( newCustomer ) );
					setView( 'load-customer' );
				}
			}
			}/>
			// translators: %s is the customer name.
			modalTitle    = sprintf( __( 'Customer: %s', 'yith-point-of-sale-for-woocommerce' ), getCustomerFullName( editingCustomer ) );
			break;
		case 'new-customer':
			viewComponent = <CustomerForm customer={defaultNewCustomerData} onSave={( newCustomer ) => {
				setLoadedCustomer( Customer( newCustomer ) );
				setView( 'load-customer' );
			}
			}/>
			modalTitle    = __( 'Create customer', 'yith-point-of-sale-for-woocommerce' );
			break;
	}

	return <Modal title={modalTitle} onClose={onClose}>
		<div className="customer-controller">
			{
				'type' !== view ?
				viewComponent :
				<>
					<ListSelector
						items={buttons}
						onSelect={_ => 'guest' === _ ? onClose() : setView( _ )}
					/>
				</>
			}
		</div>
	</Modal>

}