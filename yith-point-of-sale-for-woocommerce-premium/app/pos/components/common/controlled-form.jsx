import React, { useEffect, useState } from 'react';
import PropTypes                      from 'prop-types';
import { noop }                       from 'lodash';
import classNames                     from 'classnames';
import { __ }                         from '@wordpress/i18n';

import Input  from '../../packages/components/input';
import Button from '../../packages/components/button';
import Select from '../../packages/components/select';
import Switch from '../../packages/components/switch';

function validateField( field, value ) {
	const { isRequired } = field;
	if ( isRequired && !value ) {
		return __( 'This field is required', 'yith-point-of-sale-for-woocommerce' );
	}

	if ( typeof field?.validate === 'function' ) {
		return field.validate( value, field );
	}

	return true;
}

function isFieldValid( field, value ) {
	return true === validateField( field, value );
}

function FieldComponent( { field, onChange, value, showError: showErrorProp } ) {
	let theField                                               = null;
	field.className                                            = classNames( 'controlled-form__field', field?.className ?? '' );
	const { isRequired, label, type, validate, ...otherProps } = field;
	const [showError, setShowError]                            = useState( showErrorProp );

	const validationResult = validateField( field, value );
	const isValid          = validationResult === true;
	const validationError  = !isValid ? validationResult : '';

	useEffect( () => {
		setShowError( showErrorProp );
	}, [showErrorProp] )

	const handleChange = ( _ ) => {
		onChange( _ );
		if ( isFieldValid( field, _ ) ) {
			setShowError( false );
		}
	}

	switch ( type ) {
		case 'text':
		case 'number':
			theField = <Input {...otherProps}
				error={showError && !isValid}
				helperText={showError ? validationError : ''}
				type={type}
				value={value}
				onChange={_ => handleChange( _ )}
				onBlur={() => setShowError( true )}
			/>;
			break;
		case 'select':
			theField = <Select {...otherProps}
				allowClear={false}
				error={showError && !isValid}
				helperText={showError ? validationError : ''}
				value={value}
				onChange={_ => {
					setShowError( true );
					handleChange( _ );
				}}
			/>;
			break;
		case 'switch':
			theField = <Switch {...otherProps}
				checked={value}
				onChange={_ => handleChange( _ )}
			/>;
			break;
	}

	return <div className={`controlled-form__field-root controlled-form__field-root__${field.key}`}>
		{!!label && <label className="controlled-form__field__label">
			{label}
			{!!isRequired && <span className="required">*</span>}
		</label>}
		{theField}
	</div>
}

function ControlledForm( { className, fields, values, onChange, onSave, error, isSaving, saveText } ) {
	const classes                   = classNames( className, 'controlled-form' );
	const [showError, setShowError] = useState( false );

	const handleChange = ( key, value ) => {
		setShowError( false );
		onChange( { ...values, [ key ]: value } );
	};

	const getValue = _ => values[ _ ] ?? '';

	const isFormValid = () => {
		return !fields.filter( field => !isFieldValid( field, getValue( field.key ) ) ).length;
	}

	const handleSubmit = ( e ) => {
		e.preventDefault();
		if ( !isSaving && isFormValid() ) {
			onSave();
		} else {
			setShowError( true );
		}
	}

	return <form className={classes} onSubmit={handleSubmit} autoComplete="off">
		<div className="controlled-form__fields">
			{fields.map( field => {
				return <FieldComponent key={field.key} field={field} value={getValue( field.key )} onChange={_ => handleChange( field.key, _ )} showError={showError}/>
			} )}
		</div>
		{!!error && <div className="controlled-form__error">{error}</div>}
		<Button className="controlled-form__save" variant="primary" fullWidth isLoading={isSaving}>{saveText}</Button>
	</form>
}

ControlledForm.propTypes = {
	className: PropTypes.string,
	fields   : PropTypes.arrayOf(
		PropTypes.shape(
			{
				key       : PropTypes.string.isRequired,
				type      : PropTypes.string.isRequired,
				className : PropTypes.string,
				label     : PropTypes.string,
				error     : PropTypes.string,
				value     : PropTypes.any,
				isRequired: PropTypes.bool,
				onChange  : PropTypes.func
			}
		)
	).isRequired,
	onSave   : PropTypes.func,
	isSaving : PropTypes.bool,
	error    : PropTypes.oneOfType( [PropTypes.bool, PropTypes.string] ),
	saveText : PropTypes.string
}

ControlledForm.defaultProps = {
	className: '',
	fields   : [],
	onSave   : noop,
	isSaving : false,
	saveText : __( 'Save', 'yith-point-of-sale-for-woocommerce' ),
	error    : false
}


export default ControlledForm;