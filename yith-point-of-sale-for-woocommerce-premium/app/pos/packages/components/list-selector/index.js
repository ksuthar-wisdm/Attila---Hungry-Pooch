import PropTypes  from 'prop-types';
import { noop }   from 'lodash';
import classNames from 'classnames';

export default function ListSelector( { className, onSelect, selected, items } ) {
	return <div className={classNames( 'list-selector', className )}>
		{
			items.map( item => {
				return <div key={item.key}
					className={classNames( 'list-selector__item', { 'selected': selected === item.key } )}
					onClick={() => onSelect( item.key )}
				>
					{!!item.icon && <span className={`list-selector__item__icon yith-pos-icon-${item.icon}`}/>}
					<span className="list-selector__item__label">{item.label}</span>
				</div>
			} )
		}
	</div>

}

ListSelector.propTypes = {
	items    : PropTypes.array.isRequired,
	className: PropTypes.string,
	onSelect : PropTypes.func,
	selected : PropTypes.oneOfType( [PropTypes.string, PropTypes.number] )
}

ListSelector.defaultProps = {
	onSelect : noop,
	className: '',
	selected : '',
	items    : []
}