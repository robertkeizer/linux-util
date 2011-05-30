var	linux	= require( '../' );
var	sys	= require( 'sys' );
var	util	= require( 'util' );

console.log( "Starting up tests.." );

console.log( "linux.mountSync() gives: " );
console.log( sys.inspect( linux.mountSync() ) );

console.log( "linux.mountSync( '/dev/loop0', '/mnt/tmp', 'ext2' )" );
console.log( sys.inspect( linux.mountSync( '/dev/loop0', '/mnt/tmp', 'ext2' ) ) );

console.log( "linux.ps() gives: " );
console.log( sys.inspect( linux.ps() ) );

console.log( "linux.ps.pid(1) gives: " );
console.log( sys.inspect( linux.ps.pid(1) ) );

console.log( "linux.acpi.batteries() gives: " );
console.log( sys.inspect( linux.acpi.batteries() ) );

console.log( "linux.sysctl() gives: " );
console.log( util.inspect( linux.sysctl(), true, null ) );
