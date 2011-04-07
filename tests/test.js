var sys		= require('sys');
var linux	= require('../');
console.log( "Starting tests.." );
/*
console.log( "mounts gives: " );
console.log( sys.inspect( linux.mounts( ) ) );

console.log( "ps gives: " );
console.log( sys.inspect( linux.ps( ) ) );

console.log( "ps.pid('1') gives: " );
console.log( sys.inspect( linux.ps.pid( 1 ) ) );

if( !linux.ps.pid( 9999 ) ){
	console.log( "ps.pid('9999') returned false." );
}

if( linux.acpi.batteries() ){
	batteryArray	= linux.acpi.batteries();
	for( var x=0; x<batteryArray.length; x++ ){
		console.log( "linux.acpi.battery( '" + batteryArray[x]['name'] + "' ) gives: " );
		console.log( linux.acpi.battery( batteryArray[x]['name'] ) );
	}
}
*/

console.log( "sysctl() gives:" );
console.log( sys.inspect( linux.sysctl() ) );

console.log( "sysctl().net.ipv4.conf.all.forwrading gives:" );
console.log( linux.sysctl().net.ipv4.conf.all.forwarding );

console.log( "sysctl().fs.inode_state gives:" );
console.log( linux.sysctl().fs.inode_state );
