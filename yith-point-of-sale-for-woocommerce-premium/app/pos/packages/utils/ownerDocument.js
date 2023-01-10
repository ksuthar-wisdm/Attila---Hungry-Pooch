export default function ownerDocument( node = undefined ) {
	return ( node && node.ownerDocument ) || document;
}