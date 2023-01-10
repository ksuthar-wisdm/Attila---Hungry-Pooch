import React             from 'react';
import ReactDOM          from 'react-dom';
import { BrowserRouter } from "react-router-dom";

import App          from './components/app.jsx';
import { Provider } from 'react-redux';
import { store }    from './store/store';

function supportES6() {
	try {
		Function( "() => {};" );
		return true;
	} catch ( exception ) {
		return false;
	}
}

if ( !supportES6() ) {
	var root       = document.getElementById( 'yith-pos-root' );
	root.innerHTML = root.getAttribute( 'data-no-support' );
	root.classList.add( 'yith-pos-no-support-error' );
} else {
	const root = document.getElementById( 'yith-pos-root' );
	if ( root ) {
		ReactDOM.render(
			<BrowserRouter basename={yithPosSettings.baseUrl}>
				<Provider store={store}>
					<App/>
				</Provider>
			</BrowserRouter>,
			root
		);
	}
}
