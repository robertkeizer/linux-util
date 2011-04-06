var sys		= require('sys');
var linux	= require('../');
console.log( "Starting tests.." );

console.log( "mounts gives: " );
console.log( sys.inspect( linux.mounts( ) ) );

console.log( "ps gives: " );
console.log( sys.inspect( linux.ps( ) ) );

console.log( "ps.pid('1') gives: " );
console.log( sys.inspect( linux.ps.pid( 1 ) ) );

console.log( "acpi.batteries( ) gives: " );
console.log( sys.inspect( linux.acpi.batteries( ) ) );

console.log( "acpi.battery( 'BAT0' ) gives: " );
console.log( sys.inspect( linux.acpi.battery( "BAT0" ) ) );
