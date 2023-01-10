import { createPortal }                       from 'react-dom';
import classNames                             from 'classnames';
import { useEffect, useLayoutEffect, useRef } from 'react';
import PropTypes                              from 'prop-types';
import { noop }                               from 'lodash';

import ownerWindow   from '../../utils/ownerWindow';
import ownerDocument from '../../utils/ownerDocument';

const getAnchorRect = ( anchorRef ) => {
	return typeof anchorRef?.getBoundingClientRect === 'function' ? anchorRef.getBoundingClientRect() : null;
}

const computePopoverPosition = ( { anchorRect, container, position, verticalMargin = 0, forceMinWidth } ) => {
	let [yPos, xPos]    = position.split( ' ' );
	const computed      = {};
	const window        = ownerWindow();
	const document      = ownerDocument();
	const containerRect = container.getBoundingClientRect();

	const { innerWidth: windowWidth, innerHeight: windowHeight } = window;

	let minWidth = 0;

	if ( true === forceMinWidth ) {
		minWidth = anchorRect.width;
	} else if ( false !== forceMinWidth ) {
		minWidth = forceMinWidth;
	}

	const positions = {
		left  : anchorRect.left,
		right : windowWidth - anchorRect.right,
		top   : anchorRect.top + anchorRect.height + verticalMargin,
		bottom: windowHeight - anchorRect.top + verticalMargin
	};

	const allowedXPos = [];
	if ( positions.left + containerRect.width <= windowWidth ) {
		allowedXPos.push( 'left' );
	}
	if ( positions.right + containerRect.width <= windowWidth ) {
		allowedXPos.push( 'right' );
	}

	if ( !allowedXPos.length ) {
		// Choose the best one.
		if ( positions.left < positions.right ) {
			allowedXPos.push( 'left' );
		} else {
			allowedXPos.push( 'right' );
		}
	}

	const allowedYPos = [];
	if ( positions.top + containerRect.height <= windowHeight ) {
		allowedYPos.push( 'bottom' );
	}
	if ( positions.bottom + containerRect.height <= windowHeight ) {
		allowedYPos.push( 'top' );
	}

	if ( !allowedYPos.length ) {
		// Choose the best one.
		if ( positions.top < positions.bottom ) {
			allowedYPos.push( 'bottom' );
		} else {
			allowedYPos.push( 'top' );
		}
	}

	xPos = !allowedXPos.includes( xPos ) ? allowedXPos[ 0 ] : xPos;
	yPos = !allowedYPos.includes( yPos ) ? allowedYPos[ 0 ] : yPos;

	if ( 'left' === xPos ) {
		computed.left = positions.left;
	} else {
		computed.right = positions.right;
	}

	if ( 'bottom' === yPos ) {
		computed.top = positions.top;
	} else {
		computed.bottom = positions.bottom;
	}

	computed.maxWidth  = windowWidth - ( computed?.left ?? computed?.right );
	computed.maxHeight = windowHeight - ( computed?.top ?? computed?.bottom );

	'left' in computed && ( computed.left = Math.max( 0, computed.left ) );
	'right' in computed && ( computed.right = Math.max( 0, computed.right ) );
	'top' in computed && ( computed.top = Math.max( 0, computed.top ) );
	'bottom' in computed && ( computed.bottom = Math.max( 0, computed.bottom ) );

	if ( minWidth ) {
		computed.minWidth = Math.min( minWidth, computed.maxWidth );
	}

	computed.xPos = 'left' in computed ? 'left' : 'right';
	computed.yPos = 'top' in computed ? 'bottom' : 'top';

	const { offsetParent } = container;
	/**
	 * If there is a positioned ancestor element that is not the body,
	 * subtract the position from the anchor rect.
	 * Useful in case of disabling the Portal.
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetParent
	 */
	if ( offsetParent && offsetParent !== document.body ) {
		const offsetParentRect = offsetParent.getBoundingClientRect();
		'top' in computed && ( computed.top -= offsetParentRect.top );
		'left' in computed && ( computed.left -= offsetParentRect.left );
		'bottom' in computed && ( computed.bottom -= ( windowHeight - offsetParentRect.bottom ) );
		'right' in computed && ( computed.right -= ( windowWidth - offsetParentRect.right ) );
	}

	return computed;
}

const setStyle = ( element, prop, value = '' ) => {
	if ( element.style[ prop ] !== value ) {
		element.style[ prop ] = value;
	}
}

function setAttribute( element, prop, value ) {
	if ( !value ) {
		if ( element.hasAttribute( prop ) ) {
			element.removeAttribute( prop );
		}
	} else if ( element.getAttribute( prop ) !== value ) {
		element.setAttribute( prop, value );
	}
}

// Store popovers, to allow closing them one by one through the ESC key, from the last opened to the first one!
const popovers = [];

function Popover( { anchorRef, position = 'top', className, children, verticalMargin, onClose, forceMinWidth, disablePortal, ...props } ) {
	const containerRef = useRef();
	const document     = ownerDocument();
	const window       = ownerWindow();
	const classes      = classNames( 'popover', className );

	useEffect( () => {
		const { current: currentPopover } = containerRef;
		let currentPopoverIdx             = -1;
		if ( currentPopover ) {
			const lastPopover = popovers.at( -1 );
			if ( lastPopover !== currentPopover ) {
				popovers.push( currentPopover );
				currentPopoverIdx = popovers.length - 1;
			}
		}

		return () => {
			if ( currentPopoverIdx > -1 ) {
				popovers.splice( currentPopoverIdx, 1 );
			}
		}
	}, [] );

	useEffect( () => {
		if ( containerRef.current ) {
			containerRef.current.anchorRef = anchorRef;
		}
	}, [] );

	useLayoutEffect( () => {
		const refresh = () => {
			if ( !containerRef.current ) {
				return;
			}
			const container = containerRef.current;

			const anchorRect      = getAnchorRect( anchorRef );
			const popoverPosition = computePopoverPosition( { anchorRect, container, position, verticalMargin, forceMinWidth } );

			for ( const singlePos of ['top', 'bottom', 'right', 'left'] ) {
				if ( singlePos in popoverPosition ) {
					setStyle( container, singlePos, popoverPosition[ singlePos ] + 'px' );
				}
			}

			setStyle( container, 'max-width', popoverPosition.maxWidth + 'px' );
			setStyle( container, 'max-height', popoverPosition.maxHeight + 'px' );

			if ( 'minWidth' in popoverPosition ) {
				setStyle( container, 'min-width', popoverPosition.minWidth + 'px' );
			}

			setAttribute( container, 'data-x-pos', popoverPosition.xPos );
			setAttribute( container, 'data-y-pos', popoverPosition.yPos );
		};

		refresh();

		/**
		 * It's useful refreshing position with some interval,
		 * since there are something that can skip at resize/scroll events.
		 * So, we can refresh position each 0.5 seconds.
		 */
		const refreshInterval = setInterval( refresh, 500 );

		window.addEventListener( 'resize', refresh );
		window.addEventListener( 'scroll', refresh, true );

		return () => {
			!!refreshInterval && clearInterval( refreshInterval );

			window.removeEventListener( 'resize', refresh );
			window.removeEventListener( 'scroll', refresh );
		}
	}, [] );

	const handleKeyboardClose = e => {
		if ( e.keyCode === 27 ) {
			const { current: currentPopover } = containerRef;
			if ( currentPopover && popovers.at( -1 ) === currentPopover ) {
				onClose();
			}
		}
	};

	const handleClickOutside = e => {
		if ( containerRef?.current ) { // The container MUST exists.
			const isContainerClick   = containerRef.current.contains( e.target );
			const isAnchorClick      = anchorRef && anchorRef.contains( e.target );
			const childAnchor        = e.target.closest( '[role="presentation"]' )?.anchorRef;
			const isChildAnchorClick = childAnchor && containerRef.current.contains( childAnchor ); // Useful, if a popover is contained in another popover.
			if ( !isContainerClick && !isAnchorClick && !isChildAnchorClick ) {
				onClose();
			}
		}
	};

	useEffect( () => {
		document.addEventListener( 'mousedown', handleClickOutside );
		document.addEventListener( 'keydown', handleKeyboardClose );
		document.addEventListener( 'yith-pos-popover:close', onClose );
		return () => {
			document.removeEventListener( 'mousedown', handleClickOutside );
			document.removeEventListener( 'keydown', handleKeyboardClose );
			document.removeEventListener( 'yith-pos-popover:close', onClose );
		}
	} );

	const popover = <div {...props} className={classes} ref={containerRef} role="presentation">{children}</div>;

	return disablePortal ? popover : createPortal( popover, ownerDocument().body );
}

Popover.propTypes = {
	anchorRef     : PropTypes.instanceOf( Element ).isRequired,
	position      : PropTypes.oneOf( ['top left', 'top right', 'bottom left', 'bottom right'] ),
	className     : PropTypes.string,
	verticalMargin: PropTypes.number,
	onClose       : PropTypes.func,
	forceMinWidth : PropTypes.oneOfType( [PropTypes.bool, PropTypes.number] ),
	disablePortal : PropTypes.bool
}

Popover.defaults = {
	position      : 'top left',
	className     : '',
	verticalMargin: 0,
	onClose       : noop,
	forceMinWidth : false,
	disablePortal : false
}

export default Popover;