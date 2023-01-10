import React, { Component } from 'react';
import { Link }             from 'react-router-dom';
import { noop }             from "lodash";
import classNames           from "classnames";
import Icon                 from '../../packages/components/icon';
import Skeleton             from '../../packages/components/skeleton';


const touchDevice = ( 'ontouchstart' in document.documentElement );

function DropdownItemIcon( { icon } ) {
	if ( 'animated-hamburger-menu' === icon ) {
		return <div className="yith-pos-animated-hamburger-menu"><span/><span/><span/></div>
	}
	return !!icon ? <Icon icon={icon}/> : false;
}

function DropdownItem( { item, actions } ) {
	const classes                                                         = classNames( 'dropdown-item', item?.class ?? '' );
	const { action, icon, content, isLoading, internalLink, href, title } = item;

	if ( !href ) {
		const onClickHandler = actions[ action ] ?? noop;

		return <div className={classes} onClick={onClickHandler}>
			{!!icon && <DropdownItemIcon icon={icon}/>}
			<span className="dropdown-item__title">{title}</span>
			{!!isLoading && <Skeleton className="dropdown-item__content" variant="text" background="light" randomWidth={{ min: 10, max: 30 }}/>}
			{!isLoading && <span className="dropdown-item__content">{content}</span>}
		</div>
	}

	if ( internalLink ) {
		return <Link className={classes} to={href}>
			{!!icon && <DropdownItemIcon icon={icon}/>}
			{title}
		</Link>
	} else {
		return <a className={classes} href={href} title={title}>
			{!!icon && <DropdownItemIcon icon={icon}/>}
			{title}
		</a>;
	}
}


class DropDown extends Component {

	constructor() {
		super( ...arguments );

		this.state = {
			enabled: false
		}
	}

	enable = () => {
		this.setState( ( currentState ) => {
			if ( !currentState.enabled ) {
				'onEnable' in this.props && this.props.onEnable();
				currentState.enabled = true;
			}
			return currentState;
		} );
	};

	disable = () => {
		this.setState( ( currentState ) => {
			if ( !!currentState.enabled ) {
				'onDisable' in this.props && this.props.onDisable();
				currentState.enabled = false;
			}
			return currentState;
		} );
	};

	toggle = () => {
		this.state.enabled ? this.disable() : this.enable();
	};

	render() {
		const { enabled }                         = this.state;
		const { id, title, items, ...otherProps } = this.props;

		const enabledClass = !!enabled ? 'enabled' : '';

		const onClickHandler      = !!touchDevice ? this.toggle : noop;
		const onMouseEnterHandler = !touchDevice ? this.enable : noop;
		const onMouseLeaveHandler = this.disable;

		return (
			<div className={`dropdown ${enabledClass}`} id={id}
				onMouseEnter={onMouseEnterHandler}
				onMouseLeave={onMouseLeaveHandler}
				onClick={onClickHandler}>
				<div className="dropdown-toggle" id={`dropdown-${id}`}
					data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
					{!!title?.icon && <DropdownItemIcon icon={title.icon}/>}
					{!!title?.imgSrc && <img src={title.imgSrc}/>}
					{!!title?.label && <span>{title.label}</span>}
				</div>
				<div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
					{items.map( ( item, i ) => <DropdownItem key={i} item={item} actions={otherProps}/> )}
				</div>
			</div>
		);
	}

}

export default DropDown;