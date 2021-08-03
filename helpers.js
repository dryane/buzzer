const fetch = require("node-fetch");

function get_key_by_value(object, value) {
   return Object.keys(object).find(key => object[key] === value);
}

function key_exists(object, value) {
   if ( typeof get_key_by_value(object, value) === 'string' ) { return true };
   return false;
}

function str_obj(str) {
   if (typeof str != "string") {
      return;
   }
   str = str.split('; ');
   var result = {};
   for (var i = 0; i < str.length; i++) {
    var cur = str[i].split('=');
    result[cur[0]] = cur[1];
 }
 return result;
}

module.exports.get_key_by_value = get_key_by_value;
module.exports.key_exists = key_exists;
module.exports.str_obj = str_obj;
