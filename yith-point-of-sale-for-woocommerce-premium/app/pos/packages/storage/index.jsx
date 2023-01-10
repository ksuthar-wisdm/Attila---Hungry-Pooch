import crypto from "crypto";

const storage = {
    allowed            : typeof localStorage !== 'undefined',
    _getKey            : function ( key ) {
        if ( key.indexOf( 'yithPOS_' ) !== 0 ) {
            return 'yithPOS_' + key;
        }
        return key;
    },
    _getUsedKeys       : function () {
        let keys = localStorage.getItem( storage._getKey( '_usedKeys' ) );
        keys     = keys ? JSON.parse( keys ) : [];
        return keys;
    },
    _setUsedKeys       : function ( keys ) {
        localStorage.setItem( storage._getKey( '_usedKeys' ), JSON.stringify( keys ) );
    },
    _addUsedKey        : function ( key ) {
        let keys = storage._getUsedKeys();
        if ( keys.indexOf( key ) < 0 ) {
            keys.push( key );
            storage._setUsedKeys( keys );
        }
    },
    _removeUsedKey     : function ( key ) {
        let keys    = storage._getUsedKeys();
        const index = keys.indexOf( key );
        if ( index >= 0 ) {
            keys.splice( index, 1 );
            storage._setUsedKeys( keys );
        }
    },
    _generateStorageKey: function () {
        const storageKey = yithPosSettings.register.id + '-' + yithPosSettings.user.id;
        return crypto.createHash( 'md5' ).update( storageKey ).digest( 'hex' );
    },
    _setStorageKey     : function () {
        const storageKey = storage._generateStorageKey();
        localStorage.setItem( storage._getKey( '_storageKey' ), storageKey );
    },
    _getStorageKey     : function () {
        return localStorage.getItem( storage._getKey( '_storageKey' ) );
    },
    validate           : function () {
        if ( storage._getStorageKey() !== storage._generateStorageKey() ) {
            storage.clear();
            storage._setStorageKey();
        }
    },
    set                : function ( key, value ) {
        if ( storage.allowed ) {
            key = storage._getKey( key );
            storage._addUsedKey( key );
            localStorage.setItem( key, JSON.stringify( value ) );
        }
    },
    get                : function ( key, defaultValue = false ) {
        if ( storage.allowed ) {
            const value = localStorage.getItem( storage._getKey( key ) );
            return value ? JSON.parse( value ) : defaultValue;
        }
        return defaultValue;
    },
    remove             : function ( key ) {
        if ( storage.allowed ) {
            key = storage._getKey( key );
            localStorage.removeItem( key );
            storage._removeUsedKey( key );
        }
    },
    clear              : function () {
        if ( storage.allowed ) {
            const keys = storage._getUsedKeys();
            keys.forEach( ( key ) => {
                storage.remove( key );
            } );
            storage._setUsedKeys( [] );
        }
    }
};

storage.validate();

export default storage;