__sysctl()__ - 
Produces an object that can be used to grab or set sysctl values. Since numbers and some special
characters are not allowed in object names, full spelt out numbers are substituted.

	var linux = require( '/path/to/this/dir' );
	if( linux.sysctl().net.ipvfour.conf.all.forwarding == '1' ){
		// IPv4 forwarding for all devices is enabled.

		// Disable them
		linux.sysctl().net.ipvfour.conf.all.forwarding = 0;
	}

__ps()__ - 
Returns a detailed object of all the processes
running on a system.

__pid( pidnum )__ - 
Returns a detailed object for the specific pid number.
