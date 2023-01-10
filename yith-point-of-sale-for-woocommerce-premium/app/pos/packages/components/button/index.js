import classNames from 'classnames';
import PropTypes  from 'prop-types';
import { noop }   from 'lodash';

export default function Button(
	{
		children,
		className,
		variant,
		size,
		leftIcon,
		rightIcon,
		fullWidth,
		onClick,
		isLoading,
		...props
	}
) {
	const classes = classNames(
		'button',
		'button--' + variant,
		className,
		{
			[ `button--${size}` ]: 'normal' !== size,
			'button--full-width' : !!fullWidth,
			'is-loading'         : isLoading
		}
	);

	const handleClick = () => {
		if ( !isLoading ) {
			onClick();
		}
	}

	return (
		<button className={classes} onClick={handleClick} {...props} >
			{!!leftIcon && <span className={`button__left-icon yith-pos-icon-${leftIcon}`}/>}
			<span className="button__text">{children}</span>
			{!!rightIcon && <span className={`button__right-icon yith-pos-icon-${rightIcon}`}/>}
		</button>
	)
}

Button.propTypes = {
	className: PropTypes.string,
	variant  : PropTypes.oneOf( ['primary', 'secondary', 'tertiary', 'dark', 'outlined', 'link'] ),
	size     : PropTypes.oneOf( ['normal', 'small', 'big'] ),
	leftIcon : PropTypes.string,
	rightIcon: PropTypes.string,
	fullWidth: PropTypes.bool,
	isLoading: PropTypes.bool,
	onClick  : PropTypes.func
}

Button.defaultProps = {
	className: '',
	variant  : 'primary',
	size     : 'normal',
	leftIcon : '',
	rightIcon: '',
	fullWidth: false,
	isLoading: false,
	onClick  : noop
};