import SimpleObject from './simple-object';

const storeData = Object.assign( {}, yithPosSettings.store );

class Store extends SimpleObject {

    type = 'store';

    /** ------------------------------------------
     * Getters
     */

    getName = () => {
        return this.getProp( 'name', '' );
    };

    getVatNumber = () => {
        return this.getProp( 'vat_number', '' );
    };

    getAddress = () => {
        return this.getProp( 'address', '' );
    };

    getCity = () => {
        return this.getProp( 'city', '' );
    };

    getCountryState = () => {
        return this.getProp( 'country_state', '' );
    };

    getPostcode = () => {
        return this.getProp( 'postcode', '' );
    };

    getPhone = () => {
        return this.getProp( 'phone', '' );
    };

    getFax = () => {
        return this.getProp( 'fax', '' );
    };

    getEmail = () => {
        return this.getProp( 'email', '' );
    };

    getWebsite = () => {
        return this.getProp( 'website', '' );
    };

    getFacebook = () => {
        return this.getProp( 'facebook', '' );
    };

    getTwitter = () => {
        return this.getProp( 'twitter', '' );
    };

    getInstagram = () => {
        return this.getProp( 'instagram', '' );
    };

    getYoutube = () => {
        return this.getProp( 'youtube', '' );
    };

    getManagers = () => {
        return this.getProp( 'managers', [] );
    };

    getCashiers = () => {
        return this.getProp( 'cashiers', [] );
    };

    getFormattedAddress = () => {
        return this.getProp( 'formatted_address', '' );
    };

    /** ------------------------------------------
     * Conditionals
     */

    isEnabled = () => {
        return 'yes' === this.getProp( 'enabled', 'yes' );
    };

}

const store = new Store( storeData );

export default store;