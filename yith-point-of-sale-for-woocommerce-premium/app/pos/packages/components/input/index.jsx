import { forwardRef } from 'react';
import PropTypes      from 'prop-types';
import { noop }       from 'lodash';
import classNames     from 'classnames';

import Icon from '../icon';

const Input = forwardRef(
	( { type, value, variant, onChange, onClear, allowClear, icon, leftIcon, className, error, helperText, ...props }, ref ) => {
		const canClear = allowClear && value !== '';

		const classes = classNames(
			'pos-input-field',
			'pos-input-field--' + variant,
			{
				'pos-input-field--allow-clear'    : allowClear && value !== '',
				'pos-input-field--with-left-icon' : !!leftIcon,
				'pos-input-field--with-right-icon': !!icon || canClear,
				'error'                           : error
			}
		);

		const handleChange = ( e ) => {
			let newValue = e.target.value;
			onChange( newValue );
		};

		return (
			<div className={classNames( 'pos-field-root', className )}>
				<div className={classes}>
					<input {...props} ref={ref} className="pos-input-field__field" type={type} value={value} onChange={handleChange} autoComplete="none"/>
					{!!leftIcon && <Icon className="pos-input-field__left-icon" icon={leftIcon}/>}
					{!!icon && !canClear && <Icon className="pos-input-field__right-icon" icon={icon}/>}
					{canClear && <Icon className="pos-input-field__right-icon clear" icon="clear" onClick={onClear}/>}
				</div>
				{!!helperText && <p className={classNames( 'pos-field__helper-text', { 'error': error } )}>{helperText}</p>}
			</div>
		)
	}
);

Input.displayName = 'Input';

Input.propTypes = {
	className : PropTypes.string,
	type      : PropTypes.string,
	value     : PropTypes.oneOfType( [PropTypes.string, PropTypes.number] ),
	onChange  : PropTypes.func,
	onClear   : PropTypes.func,
	allowClear: PropTypes.bool,
	icon      : PropTypes.string,
	leftIcon  : PropTypes.string,
	variant   : PropTypes.oneOf( ['outlined', 'ghost'] ),
	error     : PropTypes.bool,
	helperText: PropTypes.string
}

Input.defaultProps = {
	className : '',
	type      : 'text',
	value     : '',
	onChange  : noop,
	onClear   : noop,
	allowClear: false,
	icon      : '',
	leftIcon  : '',
	variant   : 'outlined',
	error     : false,
	helperText: ''
};

export default Input;