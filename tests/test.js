var	linux	= require( '../' );
var	sys	= require( 'sys' );
console.log( "Starting up tests.." );

console.log( "linux.sysctl().net.ipvfour.conf.all.forwarding gives" );
console.log( linux.sysctl().net.ipvfour.conf.all.forwarding );

console.log( "Enabling forwarding.." );
linux.sysctl().net.ipvfour.conf.all.forwarding = 1;
