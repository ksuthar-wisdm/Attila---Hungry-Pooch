import { Fragment, useMemo, useRef, useState } from 'react';
import classNames                              from 'classnames';
import PropTypes                               from 'prop-types';
import { noop }                                from 'lodash';
import { __ }                                  from '@wordpress/i18n';

import Dropdown from '../dropdown';
import Input    from '../input';
import Icon     from '../icon';

function defaultRenderOption( option, args ) {
	const { classNames, onSelect, optionLabel } = args;
	return <div className={classNames} onClick={onSelect}>
		{!!option?.icon && <Icon className="pos-select-field__option__icon" icon={option?.icon}/>}
		{!!option?.iconText && <span className="pos-select-field__option__icon-text">{option?.iconText}</span>}
		{optionLabel}
	</div>
}

function Toggle( { label, icon, iconText, placeholder, onToggle, isEmpty, allowClear, onClear, isOpen } ) {
	return <div className="pos-select-field__toggle" onClick={onToggle}>
		{!!icon && <Icon className="pos-select-field__toggle__left-icon" icon={icon}/>}
		{!!iconText && <span className="pos-select-field__toggle__left-icon-text">{iconText}</span>}
		{
			!!label ?
			<span className="pos-select-field__toggle__label">{label}</span> :
			<span className="pos-select-field__toggle__placeholder">{placeholder}</span>
		}
		{
			allowClear && !isEmpty ?
			<Icon className="pos-select-field__toggle__icon pos-select-field__toggle__icon-clear" icon={'clear'} onClick={e => {
				e.stopPropagation();
				onClear();
			}}/> :
			<Icon className="pos-select-field__toggle__icon" icon={isOpen ? 'expand-less' : 'expand-more'}/>
		}
	</div>
}

function Select(
	{
		className,
		popoverClassName,
		options,
		allowClear,
		value: valueProp,
		variant,
		helperText,
		hasError,
		multiple,
		onChange,
		onClear,
		getOptionKey,
		getOptionLabel,
		renderOption,
		placeholder,
		renderFooter,
		allowSearch,
		filterSearch,
		disablePortal,
		onOpen
	}
) {
	const [searchedTerm, setSearchedTerm] = useState( '' );
	const searchRef                       = useRef();
	const optionsRef                      = useRef();

	const classes = classNames(
		className,
		'pos-select-field',
		'pos-select-field--' + variant,
		{
			'multiple': multiple,
			'error'   : hasError
		}
	);

	const popoverClasses = classNames(
		popoverClassName,
		'pos-select-field__popover',
		'pos-select-field--' + variant,
		{
			'multiple': multiple
		}
	);

	const value = !valueProp ? ( multiple ? [] : '' ) : valueProp;

	const handleChange     = ( option, args ) => {
		const { onClose } = args;
		const key         = getOptionKey( option );

		allowSearch && setSearchedTerm( '' );

		if ( multiple ) {
			const idx = value.findIndex( _ => _ === key );
			if ( idx > -1 ) {
				const newValue = [...value];
				newValue.splice( idx, 1 );
				onChange( newValue );
			} else {
				onChange( [...value, key] );
			}
		} else {
			onChange( key, option );
			onClose();
		}
	};
	const isOptionSelected = ( option ) => multiple ? value.includes( getOptionKey( option ) ) : value === getOptionKey( option );

	const isEmpty = useMemo( () => multiple ? !value.length : !value, [value, multiple] );

	const toggleIcon = useMemo( () => {
		if ( !multiple ) {
			const selectedOption = options.find( _ => isOptionSelected( _ ) );
			if ( selectedOption ) {
				return selectedOption?.icon ?? false;
			}

		}
		return false;
	}, [options, value, multiple] );

	const toggleIconText = useMemo( () => {
		if ( !multiple ) {
			const selectedOption = options.find( _ => isOptionSelected( _ ) );
			if ( selectedOption ) {
				return selectedOption?.iconText ?? false;
			}

		}
		return false;
	}, [options, value, multiple] );

	const toggleLabel = useMemo( () => {
		const selectedOptions = options.filter( _ => isOptionSelected( _ ) );
		return selectedOptions.map( getOptionLabel ).join( ', ' );
	}, [options, value, multiple] );

	const filteredOptions = useMemo( () => {
		if ( allowSearch && searchedTerm ) {
			return options.filter( option => filterSearch( option, searchedTerm ) );
		}
		return options;
	}, [searchedTerm, allowSearch, options] );

	const focusOnSearch = () => {
		if ( searchRef.current ) {
			searchRef.current.focus();
		}
	}

	const scrollToSelected = () => {
		if ( !multiple && !!value && optionsRef?.current ) {
			const firstSelectedOption = optionsRef.current.querySelector( '.selected' );
			if ( firstSelectedOption ) {
				optionsRef.current.scrollTo( 0, Math.max( 0, firstSelectedOption.offsetTop - optionsRef.current.clientHeight / 2 ) );
			}
		}
	}

	const onOpenHandler = () => {
		focusOnSearch();
		scrollToSelected();
		onOpen();
	}

	return <div className={classNames( 'pos-field-root', className )}>
		<Dropdown
			className={classes}
			renderToggle={( { isOpen, onToggle, onClose } ) => {
				return <Toggle
					label={toggleLabel}
					icon={toggleIcon}
					iconText={toggleIconText}
					placeholder={placeholder}
					onToggle={onToggle}
					isEmpty={isEmpty}
					allowClear={allowClear}
					onClear={() => {
						onClear()
						onClose();
					}}
					isOpen={isOpen}/>
			}}
			renderContent={( { onClose } ) => {
				return <>
					{
						!!options.length && allowSearch &&
						<Input
							ref={searchRef}
							type="text"
							variant="ghost"
							className="pos-select-field__search"
							value={searchedTerm}
							onChange={_ => setSearchedTerm( _ )}
							onClear={() => setSearchedTerm( '' )}
							allowClear={true}
							leftIcon="search"
							placeholder={__( 'Search', 'yith-point-of-sale-for-woocommerce' )}
						/>
					}
					{!!options.length &&
					 <div className="pos-select-field__options" ref={optionsRef}>
						 {!!filteredOptions.length ?
						  filteredOptions.map( option => {
							  const optionIsSelected = isOptionSelected( option );
							  const args             = {
								  isSelected : optionIsSelected,
								  classNames : classNames(
									  'pos-select-field__option',
									  {
										  'selected': optionIsSelected
									  }
								  ),
								  onSelect   : () => handleChange( option, { onClose } ),
								  optionLabel: getOptionLabel( option )
							  }

							  return <Fragment key={getOptionKey( option )}>{renderOption( option, args )}</Fragment>;
						  } ) :
						  <div className="pos-select-field__no-results">{__( 'No results', 'yith-point-of-sale-for-woocommerce' )}</div>
						 }
					 </div>
					}
					{typeof renderFooter === 'function' &&
					 <div className="pos-select-field__footer">{renderFooter()}</div>
					}
				</>
			}}
			popoverProps={{ position: 'bottom left', className: popoverClasses, forceMinWidth: true, disablePortal }}
			onOpen={onOpenHandler}
		/>
		{!!helperText && <p className={classNames( 'pos-field__helper-text', { 'error': hasError } )}>{helperText}</p>}
	</div>
}

Select.propTypes = {
	className       : PropTypes.string,
	popoverClassName: PropTypes.string,
	variant         : PropTypes.oneOf( ['outlined', 'ghost'] ),
	placeholder     : PropTypes.string,
	options         : PropTypes.array,
	value           : PropTypes.oneOfType( [PropTypes.string, PropTypes.number, PropTypes.array, PropTypes.bool] ),
	multiple        : PropTypes.bool,
	onChange        : PropTypes.func,
	getOptionLabel  : PropTypes.func,
	getOptionKey    : PropTypes.func,
	renderOption    : PropTypes.func,
	allowClear      : PropTypes.bool,
	onClear         : PropTypes.func,
	hasError        : PropTypes.bool,
	helperText      : PropTypes.string,
	allowSearch     : PropTypes.bool,
	filterSearch    : PropTypes.func,
	disablePortal   : PropTypes.bool,
	onOpen          : PropTypes.func
}

Select.defaultProps = {
	className       : '',
	popoverClassName: '',
	variant         : 'outlined',
	placeholder     : '',
	options         : [],
	value           : '',
	multiple        : false,
	onChange        : noop,
	getOptionLabel  : _ => _.label,
	getOptionKey    : _ => _.key,
	renderOption    : defaultRenderOption,
	allowClear      : false,
	onClear         : noop,
	hasError        : false,
	helperText      : '',
	allowSearch     : false,
	filterSearch    : ( option, search ) => option.label.toLowerCase().indexOf( search.toLowerCase() ) >= 0,
	disablePortal   : false,
	onOpen          : noop
};

export default Select;