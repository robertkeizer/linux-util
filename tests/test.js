var	linux	= require( '../' );
var	sys	= require( 'sys' );
console.log( "Starting up tests.." );

var sysctl	= linux.sysctl();

console.log( "sysctl is : " + sys.inspect( sysctl ) );

if( sysctl.net.ipvfour.conf.all.forwarding == 0 ){
	console.log( "Forwarding is disabled.. Trying to enable.." );
	sysctl.net.ipvfour.conf.all.forwarding = 1;
}else{
	console.log( "Forwarding is enabled.. Trying to disable.." );
	sysctl.net.ipvfour.conf.all.forwarding = 0;
}
