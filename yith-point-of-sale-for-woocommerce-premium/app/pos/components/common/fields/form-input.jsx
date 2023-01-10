import React from "react";

const FormInput = ( { name, label, error, readOnly, isRequired, autoComplete, ...rest } ) => {

	let classGroup = "form-group form-group-" + name;
	classGroup += ( error ? ' form-group-with-errors' : '' );
	const required = isRequired ? '*' : '';

	return (
		<div className={classGroup}>
			<label htmlFor={name}>{label} <span className="required">{required}</span></label>
			<input {...rest} name={name} id={name} className="form-control" readOnly={readOnly} autoComplete={autoComplete ?? 'off'}/>
			{error && <div className="alert alert-danger">{error}</div>}
		</div>
	);
};

export default FormInput;
