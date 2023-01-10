import PropTypes                       from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import classNames                      from 'classnames';
import { noop }                        from 'lodash';

import Popover from '../popover';
import Button  from '../button';

const renderToggleField = ( { buttonProps, onToggle, buttonText } ) => {
	return <Button
		{...buttonProps}
		className={classNames( 'dropdown__toggle', buttonProps?.className ?? '' )}
		variant={buttonProps?.variant ?? 'secondary'}
		onClick={onToggle}
	>{buttonText}</Button>
}

function Dropdown( { className, buttonText: buttonTextProp, buttonProps: buttonPropsProp, renderContent, renderToggle, popoverProps, onOpen } ) {
	const containerRef        = useRef();
	const [isOpen, setIsOpen] = useState( false );
	const containerClasses    = classNames(
		'dropdown',
		className,
		{
			'opened': isOpen
		}
	);

	useEffect( () => {
		if ( isOpen ) {
			onOpen();
		}
	}, [isOpen] )

	const buttonProps = typeof buttonPropsProp === 'function' ? buttonPropsProp( { isOpen } ) : buttonPropsProp;
	const buttonText  = typeof buttonTextProp === 'function' ? buttonTextProp( { isOpen } ) : buttonTextProp;

	const toggle = () => {
		setIsOpen( ( prevOpened ) => !prevOpened );
	}

	const close = () => setIsOpen( false );
	const open  = () => setIsOpen( true );

	const args = { isOpen, onToggle: toggle, onClose: close, onOpen: open };

	return <div className={containerClasses} ref={containerRef}>
		{renderToggle( { ...args, buttonText, buttonProps } )}
		{isOpen && <Popover
			verticalMargin={10}
			{...popoverProps}
			className={classNames( 'dropdown__content', popoverProps?.className ?? '' )}
			anchorRef={containerRef.current}
			onClose={() => close()}
		>{renderContent( args )}</Popover>}
	</div>

}

Dropdown.propTypes = {
	className    : PropTypes.string,
	buttonText   : PropTypes.oneOfType( [PropTypes.string, PropTypes.func] ),
	buttonProps  : PropTypes.oneOfType( [PropTypes.object, PropTypes.func] ),
	renderToggle : PropTypes.func,
	renderContent: PropTypes.func,
	popoverProps : PropTypes.object,
	onOpen       : PropTypes.func
}

Dropdown.defaultProps = {
	className    : '',
	buttonText   : '',
	buttonProps  : {},
	renderToggle : renderToggleField,
	renderContent: noop,
	popoverProps : {},
	onOpen       : noop
};

export default Dropdown;