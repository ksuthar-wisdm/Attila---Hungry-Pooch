import React, { Component } from 'react';
import AsyncSelect          from 'react-select/async';

import Button from '../../packages/components/button';
import Select from '../../packages/components/select';

import FormInput        from './fields/form-input.jsx';
import TextArea         from './fields/textarea.jsx';
import InputAmount      from './fields/input-amount.jsx';
import ControlledNumber from "./fields/controlled-number";

class Form extends Component {

	constructor() {
		super( ...arguments );
		this.state = {
			data : {},
			error: {}
		}
		;

		this.customSelectStyles = selectStyle();

	}

	handleChange = ( name, value ) => {
		const data   = { ...this.state.data };
		data[ name ] = value;

		this.setState( { data } );
	};

	handleFieldChange = ( { currentTarget: input } ) => {
		this.handleChange( input.name, input.value );
	};

	handleSubmit = e => {
		e.preventDefault();
		this.doSubmit();
	};

	onClick = ( { currentTarget: input } ) => {

	}

	handleSwitch = ( percentage ) => {

	}

	renderInput( name, label, placeholder = '', type = "text", readOnly = false, isRequired = false ) {
		const { data, error } = this.state;

		return (
			<FormInput
				type={type}
				name={name}
				value={data[ name ]}
				label={label}
				placeholder={placeholder}
				onChange={this.handleFieldChange}
				onClick={this.onClick}
				readOnly={readOnly}
				isRequired={isRequired}
				error={( name in error ) ? error[ name ] : ''}
			/>
		);
	}

	renderInputAmount( name, label ) {
		const { data, errors } = this.state;

		return (
			<InputAmount
				name={name}
				value={data[ name ]}
				label={label}
				onChange={this.handleFieldChange}
				onSwitch={this.handleSwitch}
				onClick={this.onClick}
				data={data}
			/>
		);
	}

	renderButton( label, props = {} ) {
		return <Button variant="primary" fullWidth {...props} >{label}</Button>;
	}

	renderTextArea( name, label ) {
		const { data, errors } = this.state;

		return (
			<TextArea
				name={name}
				value={data[ name ]}
				label={label}
				onChange={this.handleFieldChange}
			/>
		);
	}

	renderSelect( name, label, options = [], customHandleChange = false ) {
		const { data }   = this.state;
		const classGroup = "form-group form-group-" + name;
		const value      = data[ name ] ?? '';

		const handleChange = !!customHandleChange ? customHandleChange : ( _ => this.handleChange( name, _ ) );

		return (
			<div className={classGroup}>
				<label htmlFor={name}>{label}</label>
				<Select
					value={value}
					options={options}
					onChange={handleChange}
				/>
			</div>
		);
	}

	noOptionsSelectMessage() {
	}

	renderAsyncSelect( name, label, loadOptions, onChange, defaultOptions, placeholder, ...rest ) {
		const classGroup = "form-group form-group-" + name;

		return (
			<div className={classGroup}>
				<label htmlFor={name}>{label}</label>

				<div className="select2-wrapper">
					<AsyncSelect
						{...rest}
						styles={this.customSelectStyles}
						cacheOptions
						loadOptions={loadOptions}
						defaultOptions={defaultOptions}
						onInputChange={this.handleInputChange}
						noOptionsMessage={this.noOptionsSelectMessage}
						placeholder={placeholder}
						onChange={onChange}
						isClearable="true"
						theme={theme => ( {
							...theme,
							borderRadius: 0,
							colors      : {
								...theme.colors,
								primary25: '#f7f7f7',
								primary50: '#f7f7f7',
								primary75: '#f7f7f7',
								primary  : '#f7f7f7'
							}
						} )}
					/>
				</div>
			</div>
		);
	}

	renderControlledNumber( name, label, withPercentage, onChange, onUndo, isRequired ) {
		const { data, error } = this.state;
		const classGroup      = "form-group form-group-" + name;
		const required        = isRequired ? '*' : '';
		return (
			<div className={classGroup}>
				<label htmlFor={name}>{label} <span className="required">{required}</span></label>


				<ControlledNumber
					value={data[ name ]}
					onChange={onChange}
					onUndo={onUndo}
					withPercentage={withPercentage}
					error={( name in error ) ? error[ name ] : ''}
				/>

			</div>
		);
	}
}

export default Form;

export const validateEmail = mail => {
	const pattern = new RegExp( /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i );
	return pattern.test( mail );
}

export const selectStyle = () => {
	return ( {
		indicatorSeparator: () => ( { display: 'none' } ),
		indicatorContainer: ( provided ) => ( { ...provided, padding: '2px' } ),
		control           : ( provided, state ) => ( {
				...provided,
				borderRadius: '0',
				borderColor : '#d7d7d7',
				"&:hover"   : { borderColor: '#f7f7f7', boxShadow: "0 0 0 1px #d7d7d7" }
			}
		),
		menu              : ( provided, state ) => ( { ...provided, borderRadius: '0' } ),
		option            : ( provided, state ) => ( {
			...provided,
			color          : '#000000',
			backgroundColor: '#ffffff',
			":active"      : { backgroundColor: '#f7f7f7', color: '#000000' },
			"&:hover"      : { backgroundColor: '#f7f7f7' }
		} ),
		noOptionsMessage  : ( provided, state ) => ( { ...provided, textAlign: 'left' } ),
		loadingMessage    : ( provided, state ) => ( { ...provided, textAlign: 'left' } )
	} );
}