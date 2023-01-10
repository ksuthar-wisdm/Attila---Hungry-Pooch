import PropTypes  from 'prop-types';
import { noop }   from 'lodash';
import classNames from 'classnames';
import { _x }     from '@wordpress/i18n';

function Switch( { className, value, checked, onChange, ...props } ) {
	const classes = classNames(
		'switch',
		className
	);

	const handleChange = ( e ) => {
		if ( e.nativeEvent.defaultPrevented ) {
			return;
		}

		const newValue = e.target.checked;
		onChange( newValue );
	};

	return <span className={classes} onClick={() => onChange( !checked )}>
		<input {...props} className="switch__field" type="checkbox" value={value} checked={checked} onChange={handleChange}/>
		<span className="switch__track">
			<span className="switch__text">{!!checked ? _x( 'Yes', 'Switch field text', 'yith-point-of-sale-for-woocommerce' ) : _x( 'No', 'Switch field text', 'yith-point-of-sale-for-woocommerce' )}</span>
			<span className="switch__thumb"/>
		</span>
	</span>
}

Switch.propTypes = {
	className: PropTypes.string,
	value    : PropTypes.string,
	checked  : PropTypes.bool,
	onChange : PropTypes.func
}

Switch.defaultProps = {
	className: '',
	value    : 'on',
	checked  : false,
	onChange : noop
};

export default Switch;