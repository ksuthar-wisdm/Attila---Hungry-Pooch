import ownerDocument from './ownerDocument';

export default function ownerWindow( node = undefined ) {
	const doc = ownerDocument( node );
	return doc.defaultView || window;
}