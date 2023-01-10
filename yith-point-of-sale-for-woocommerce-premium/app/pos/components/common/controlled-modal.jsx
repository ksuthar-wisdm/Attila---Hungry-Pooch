import React, { Component, Fragment }          from 'react';
import ControlledModalContent                  from './controlled-modal-content';
import Confirm                                 from './confirm';
import { closeModalsWhenClickingOnBackground } from '../../packages/settings';
import { noop }                                from "lodash";

class ControlledModal extends Component {
	constructor() {
		super( ...arguments );
		this.state = {
			isOpen     : false,
			title      : '',
			content    : '',
			className  : '',
			closeButton: false
		};
	}

	componentDidMount() {
		if ( this.props.allowClosingWithEsc ) {
			document.addEventListener( 'keydown', this.handleKeydown, false );
		}
	}

	componentWillUnmount() {
		if ( this.props.allowClosingWithEsc ) {
			document.removeEventListener( 'keydown', this.handleKeydown, false );
		}
	}

	handleKeydown = ( event ) => {
		if ( this.state.isOpen ) {
			if ( event.keyCode === 27 ) {
				this.close();
			}
		}
	};

	open = ( content = '', title = '', className = '', closeButton = false ) => {
		this.setState( { content, title, className, isOpen: true, closeButton } );
	};

	close = () => {
		this.setState( { isOpen: false } );
	};

	render() {
		const { title, content, className, isOpen, closeButton } = this.state;

		const handleWrapperClick = closeModalsWhenClickingOnBackground() ? this.close : noop;

		return isOpen ? <ControlledModalContent
						  title={title}
						  content={content}
						  className={className}
						  handleWrapperClick={handleWrapperClick}
						  handleCloseClick={this.close}
						  closeButton={closeButton}
					  /> :
			   <Fragment/>
	}
}

ControlledModal.defaultProps = {
	allowClosingWithEsc: true
};

export default ControlledModal;
