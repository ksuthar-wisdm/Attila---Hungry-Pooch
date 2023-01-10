import { forwardRef } from 'react';
import PropTypes      from 'prop-types';
import { noop }       from 'lodash';
import classNames     from 'classnames';

const Link = forwardRef(
	( { className, variant, layout, children, href, onClick, ...props }, ref ) => {
		const classes = classNames(
			'link',
			'link--' + variant,
			'link--' + layout + '-layout',
			className
		);

		const handleClick = e => {
			if ( '#' === href || !href ) {
				e.preventDefault();
			}
			onClick();
		}

		return (
			<a className={classes} href={href} onClick={handleClick} {...props} ref={ref}>{children}</a>
		)
	}
);

Link.displayName = 'Link';

Link.propTypes = {
	className: PropTypes.string,
	onClick  : PropTypes.func,
	href     : PropTypes.string,
	variant  : PropTypes.oneOf( ['underlined', 'bold'] ),
	layout   : PropTypes.oneOf( ['normal', 'inline-flex'] )
}

Link.defaultProps = {
	className: '',
	onClick  : noop,
	href     : '#',
	variant  : 'underlined',
	layout   : 'normal'
};

export default Link;