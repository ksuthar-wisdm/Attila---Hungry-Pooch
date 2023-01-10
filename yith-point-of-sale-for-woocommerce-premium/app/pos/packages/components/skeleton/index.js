import PropTypes  from 'prop-types';
import classNames from 'classnames';

function getRandomInt( min, max ) {
	min = Math.ceil( min );
	max = Math.floor( max );
	return Math.floor( Math.random() * ( max - min ) + min );
}

const DEFAULT_RANDOM_WIDTH = {
	min : 0,
	max : 100,
	type: 'percentage'
};

function getRandomWidth( options ) {
	const { min, max, type } = { ...DEFAULT_RANDOM_WIDTH, ...options };
	const size               = getRandomInt( min, max );
	const unit               = type === 'px' ? 'px' : '%';

	return size + unit;
}

const Skeleton = ( { className, variant, style: styleProp, randomWidth, background: backgroundProp, ...props } ) => {
	const classes = classNames(
		'skeleton',
		`skeleton--${variant}`,
		className
	);

	const style      = { ...styleProp };
	const background = {
						   light: 'rgba(255,255,255,0.11)',
						   dark : 'rgba(0,0,0,0.09)'
					   }[ backgroundProp ] ?? backgroundProp;

	if ( Object.keys( randomWidth ).length ) {
		style.width = getRandomWidth( randomWidth );
	}

	style.background = style?.background ?? background;

	return <div className={classes} style={style} {...props} />
};

Skeleton.propTypes = {
	className  : PropTypes.string,
	style      : PropTypes.object,
	randomWidth: PropTypes.shape(
		{
			min : PropTypes.number,
			max : PropTypes.number,
			type: PropTypes.oneOf( ['px', 'percentage'] )
		}
	),
	variant    : PropTypes.oneOf( ['text', 'rectangular', 'rounded', 'title', 'circle'] ),
	background : PropTypes.oneOfType(
		[
			PropTypes.oneOf( ['light', 'dark'] ),
			PropTypes.string
		]
	)
}

Skeleton.defaultProps = {
	className  : '',
	style      : {},
	variant    : 'text',
	randomWidth: {},
	background : 'dark'
}

export default Skeleton;