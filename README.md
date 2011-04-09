linux-util
==========

Overview
--------
A library to help with linux specific functionality.

linux.sysctl()
--------------
Produces an object that can be used
to grab sysctl values. Since numbers and some special
characters are not allowed in object names,
full spelt out numbers are substituted.
	
	linux.sysctl().net.ipvfour.conf.all.forwarding

linux.ps()
----------
Returns a detailed object of all the processes
running on a system.

	linux.pid( pidnum )
