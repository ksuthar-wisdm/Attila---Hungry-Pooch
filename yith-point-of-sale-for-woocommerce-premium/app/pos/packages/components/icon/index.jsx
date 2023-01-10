import classNames from 'classnames';

export default function Icon( { className, icon, ...otherProps } ) {
	const classes = classNames( className, `yith-pos-icon-${icon}` );
	return <i {...otherProps} className={classes}/>
}