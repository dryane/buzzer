const fetch = require("node-fetch");

function get_key_by_value(object, value) {
   return Object.keys(object).find(key => object[key] === value);
}

function key_exists(object, value) {
   if ( typeof get_key_by_value(object, value) === 'string' ) { return true };
   return false;
}

module.exports.get_key_by_value = get_key_by_value;
module.exports.key_exists = key_exists;
