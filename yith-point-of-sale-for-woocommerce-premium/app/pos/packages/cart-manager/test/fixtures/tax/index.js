import noTax                  from './no-tax';
import taxPricesIncludeTax    from './prices-include-tax';
import taxPricesNotIncludeTax from './prices-not-include-tax';

export function getNoTax() {
    return Object.assign( {}, noTax );
}

export function getTaxPricesIncludeTax() {
    return Object.assign( {}, taxPricesIncludeTax );
}

export function getTaxPricesNotIncludeTax() {
    return Object.assign( {}, taxPricesNotIncludeTax );
}