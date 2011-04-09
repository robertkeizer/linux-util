var	linux	= require( '../' );
var	sys	= require( 'sys' );
console.log( "Starting up tests.." );

console.log( "linux.sysctl() gives" );
console.log( sys.inspect( linux.sysctl() ) );

console.log( "linux.sysctl().net.ipvfour.conf.all.forwarding gives" );
console.log( linux.sysctl().net.ipvfour.conf.all.forwarding );
