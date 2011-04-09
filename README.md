Overview
--------
A library to help with linux specific functionality.

linux.sysctl()
--------------
Produces an object that can be used
to grab sysctl values. Since numbers and some special
characters are not allowed in object names,
full spelt out numbers are substituted.

	var linux = require( '/path/to/this/dir' );
	if( linux.sysctl().net.ipvfour.conf.all.forwarding == '1' ){
		// IPv4 forwarding for all devices is enabled.
	}

linux.ps()
----------
Returns a detailed object of all the processes
running on a system.

linux.pid( pidnum )
-------------------
Returns a detailed object for the specific pid number.
