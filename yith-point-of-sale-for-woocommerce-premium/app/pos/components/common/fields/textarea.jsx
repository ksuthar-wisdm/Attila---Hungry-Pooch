import React from "react";

const Textarea = ({ name, label, error, textareaContent, ...rest }) => {
    return (
        <div className="form-group">
            <label htmlFor={name}>{label}</label>
            <div className="textarea-wrapper">
            <textarea {...rest} name={name} id={name} className="form-control">{textareaContent}</textarea>
            <i className="yith-pos-icon-item-note"></i>
            </div>
        </div>
    );
};

export default Textarea;
