import React, { Component } from 'react';
import ReactDOM             from 'react-dom';

class ControlledModalContent extends Component {
    render() {
        const { title, content, className, handleWrapperClick, handleCloseClick, closeButton } = this.props;

        const wrapperClass = 'modal-wrap ' + ( className === '' ? '' : ' ' + className );

        let titleClass = 'modal__title';

        titleClass += title.length ? '' : ' modal__title--empty-title';

        return ReactDOM.createPortal(
            <div className={wrapperClass} onClick={handleWrapperClick}>
                <div className="modal" onClick={( e ) => e.stopPropagation()}>
                    {(!!title || !!closeButton) && <div className={titleClass}>
                        <span dangerouslySetInnerHTML={{ __html: title }}/>
                        {closeButton && <i className='yith-pos-icon-clear modal__close' onClick={handleCloseClick}/>}
                    </div>
                    }
                    <div className="modal__content">
                        {content}
                    </div>
                </div>
            </div>
            , document.body )
    }
}

export default ControlledModalContent;
