import classNames from 'classnames';
import PropTypes  from 'prop-types';

import Icon from '../icon';

export default function BlankState( { className, icon, message, size, actionElement } ) {

	const classes = classNames(
		className,
		'blank-state',
		`blank-state--${size}`
	)

	return (
		<div className={classes}>
			{!!icon && <Icon className="blank-state__icon" icon={icon}/>}
			<div className="blank-state__message">{message}</div>
			{actionElement && <div className="blank-state__actions">{actionElement}</div>}
		</div>
	)
}

BlankState.propTypes = {
	className    : PropTypes.string,
	icon         : PropTypes.string,
	message      : PropTypes.string,
	size         : PropTypes.oneOf( ['small', 'large'] ),
	actionElement: PropTypes.element
}

BlankState.defaultProps = {
	className    : '',
	icon         : '',
	message      : '',
	size         : 'large',
	actionElement: null
}