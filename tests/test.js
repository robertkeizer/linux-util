var	linux	= require( '../' );
var	util	= require( 'util' );

function out( msg ){
	console.log( msg );
}

out( util.inspect( linux.ps() ) );
out( util.inspect( linux.ps( process.pid ) ) );
out( util.inspect( linux.sysctl() ) );
out( util.inspect( linux.sysctl( 'net.ipv4.conf.all.forwarding' ) ) );
