import React, { Component } from 'react';
import classNames           from 'classnames';


function NavItem( { itemKey, active, enabled, onClick, icon, label, description } ) {
	const isActive  = active ?? false;
	const isEnabled = enabled ?? true;

	const classes = classNames(
		'nav-item',
		`nav-item__${itemKey}`,
		{
			active  : isActive,
			disabled: !isEnabled
		}
	);

	return (
		<span
			className={classes}
			onClick={
				() => {
					if ( isEnabled && typeof onClick === 'function' ) {
						onClick();
					}
				}
			}
		>
			{!!icon && <i className={`nav-item__icon yith-pos-icon-${icon}`}/>}
			<span className="nav-item__label-container" style={{textAlign: 'center'}}>
				<span className="nav-item__label">
					{label}
				</span>
				{!!description && <span className="nav-item__description">
					{description}
				</span>}
			</span>
		</span>
	)
}

export default function Nav( { className, items } ) {
	const navClasses = classNames( 'nav', className );
	return <div className={navClasses}>
		{items.map( ( item ) => <NavItem key={item.key}
			itemKey={item.key}
			active={item?.active}
			enabled={item?.enabled}
			icon={item?.icon}
			label={item?.label}
			description={item?.description}
			onClick={item?.onClick}
		/> )}
	</div>
}