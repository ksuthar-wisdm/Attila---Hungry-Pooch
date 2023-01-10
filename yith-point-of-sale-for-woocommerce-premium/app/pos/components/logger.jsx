import React, { Component } from 'react';

export function isLoggerEnabled() {
    return yithPosSettings.loggerEnabled;
}

class LoggerStore {

    logs  = [];
    items = [];

    static parseObjectHTML( object, level = 0 ) {
        let _content = '';

        Object.keys( object ).forEach( function ( key ) {
            let value  = object[ key ];
            const type = typeof value;
            if ( type === 'object' && value !== null ) {
                const isArray = Array.isArray( value );
                let start     = isArray ? '[' : '{';
                let end       = isArray ? ']' : '}';

                value = LoggerStore.parseObjectHTML( value, level + 1 );

                if ( value.length ) {
                    start += `<div class='yith-pos-log__level yith-pos-log__level-${level}'>`;
                    end = '</div>' + end;
                }

                value = start + value + end;
            } else if ( type === 'string' ) {
                value = `"${value}"`;
            }
            _content += `<div><strong>${key}</strong>: ${value}</div>`;
        } );
        return _content;
    }

    addLog( key, title, content, keepHistory = false ) {
        if ( !isLoggerEnabled() ) {
            return;
        }
        const index = this.searchLog( key );

        if ( typeof content === 'object' ) {
            content = LoggerStore.parseObjectHTML( content );
        }

        if ( index >= 0 ) {
            this.updateLog( key, { key, title, content }, keepHistory );
        } else {
            this.logs.push( { key, title, content } );
            this.update();
        }
    }

    searchLog = ( key ) => {
        let logs = this.getLogs();
        return logs.findIndex( i => i.key === key );
    };

    updateLog( key, log, keepHistory = false ) {
        if ( !isLoggerEnabled() ) {
            return;
        }
        let logs    = this.getLogs();
        const index = this.searchLog( key );

        if ( index >= 0 ) {
            if ( keepHistory && 'content' in log ) {
                log.content = logs[ index ].content + '\n' + log.content;
            }
            logs[ index ] = Object.assign( {}, logs[ index ], log );
            this.update();
            return true;
        }
        return false;
    }

    getLogs() {
        return this.logs;
    }

    register( item ) {
        this.items.push( item );
    }

    update() {
        if ( !isLoggerEnabled() ) {
            return;
        }
        for ( let i in this.items ) {
            const item = this.items[ i ];
            if ( 'onUpdate' in item ) {
                item.onUpdate( this.getLogs() );
            }
        }
    }
}

export const loggerStore = new LoggerStore();

class Log extends Component {
    constructor() {
        super( ...arguments );

        this.state = {
            opened: true
        };
    }

    toggle = () => {
        this.setState( { opened: !this.state.opened } );
    };

    render() {
        const { log }    = this.props;
        const { opened } = this.state;

        return (
            <div className="yith-pos-log">
                <div className="yith-pos-log__title" onClick={this.toggle}>{log.title}</div>
                {opened && <div className="yith-pos-log__content" dangerouslySetInnerHTML={{ __html: log.content }}/>}
            </div>
        );
    }
}

class Logger extends Component {

    constructor() {
        super( ...arguments );

        loggerStore.register( this );

        this.state = {
            logs: loggerStore.getLogs()
        };
    }

    onUpdate = ( logs ) => {
        this.setState( { logs } );
    };

    render() {
        const { logs } = this.state;

        return (
            <div className="yith-pos-logger">
                {logs.map( ( log ) => <Log key={log.key} log={log}/> )}
            </div>
        );
    }
}

export default Logger;
