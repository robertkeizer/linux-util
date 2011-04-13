var	linux	= require( '../' );
var	sys	= require( 'sys' );
var	util	= require( 'util' );

console.log( "Starting up tests.." );

console.log( "linux.mounts() gives: " );
console.log( sys.inspect( linux.mounts() ) );

console.log( "linux.ps() gives: " );
console.log( sys.inspect( linux.ps() ) );

console.log( "linux.ps.pid(1) gives: " );
console.log( sys.inspect( linux.ps.pid(1) ) );

console.log( "linux.acpi.batteries() gives: " );
console.log( sys.inspect( linux.acpi.batteries() ) );

console.log( "linux.sysctl() gives: " );
console.log( util.inspect( linux.sysctl(), true, null ) );
