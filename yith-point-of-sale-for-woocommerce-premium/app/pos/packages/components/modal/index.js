import { createPortal }             from 'react-dom';
import classNames                   from 'classnames';
import React, { useEffect, useRef } from 'react';
import PropTypes                    from 'prop-types';
import { noop }                     from 'lodash';

import { closeModalsWhenClickingOnBackground } from '../../settings';

export default function Modal( { className, title, children, onClose, canBeClosed } ) {
	const modalRef = useRef();
	const classes  = classNames(
		'modal-wrap',
		className ?? ''
	);

	const titleClass = classNames(
		'modal__title',
		{
			'modal__title--empty-title': !title.length
		}
	);

	const handleKeyboardClose = e => {
		if ( !canBeClosed ) {
			return;
		}
		if ( e.keyCode === 27 ) {
			onClose();
		}
	};

	useEffect( () => {
		if ( !canBeClosed ) {
			return;
		}
		document.addEventListener( 'keydown', handleKeyboardClose );
		return () => document.removeEventListener( 'keydown', handleKeyboardClose );
	}, [canBeClosed] );

	const handleClickOnOverlay = ( e ) => {
		if ( closeModalsWhenClickingOnBackground() && modalRef?.current ) {
			const isContainerClick   = modalRef.current.contains( e.target );
			const childAnchor        = e.target.closest( '[role="presentation"]' )?.anchorRef;
			const isChildAnchorClick = childAnchor && modalRef.current.contains( childAnchor ); // Useful, if a "presentation" element (as a popover) is contained in the modal.
			if ( !isContainerClick && !isChildAnchorClick ) {
				onClose();
			}
		}
	}

	return (
		createPortal(
			<div className={classes} onClick={handleClickOnOverlay}>
				<div className="modal" ref={modalRef}>
					{
						( !!title || !!canBeClosed ) &&
						<div className={titleClass}>
							<span dangerouslySetInnerHTML={{ __html: title }}/>
							{canBeClosed && <i className="yith-pos-icon-clear modal__close" onClick={onClose}/>}
						</div>
					}
					<div className="modal__content">{children}</div>
				</div>
			</div>,
			document.body
		)
	)
}

Modal.propTypes = {
	className  : PropTypes.string,
	title      : PropTypes.string,
	onClose    : PropTypes.func,
	canBeClosed: PropTypes.bool
}

Modal.defaultProps = {
	className  : '',
	title      : '',
	onClose    : noop,
	canBeClosed: true
};