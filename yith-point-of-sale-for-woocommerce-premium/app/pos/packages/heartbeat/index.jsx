/** global yithPosSettings */
import ajax from '../ajax';

const heartbeat = function () {
    const { user, register } = yithPosSettings;
    const userId             = user.id;
    const registerId         = register.id;
    let options              = {
        interval: yithPosSettings.heartbeat.interval,
        lastTick: 0
    };

    function time() {
        return ( new Date() ).getTime();
    }

    function tick() {
        options.lastTick = time();
        const ajaxData   = {
            register_id: registerId,
            user_id    : userId,
            action     : 'yith_pos_heartbeat_tick',
            security   : yithPosSettings.heartbeat.nonce
        };

        ajax( ajaxData ).then( response => {
            if ( response.locked_by || response.register_closed ) {
                location.reload();
            }
        } )
            .catch( error => {
                console.log( { error } );
            } );
    }

    function initialize() {
        tick();
        setInterval( tick, options.interval * 1000 );
    }

    initialize();
};

export default heartbeat;