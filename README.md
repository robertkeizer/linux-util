Utilities for linux written in javascript.

Example
=======
	var util	= require( "util" );
	var linux	= require( "linux-util" );

	linux.ps( function( err, processes ){
		processes.forEach( function( process_details ){
			util.log( "I found process '" + process_details.pid + "'." );
			util.log( util.inspect( process_details ) );
		} );
	} );

	linux.ps( 1, function( err, process_details ){
		util.log( "Init details: " + util.inspect( process_details ) );
	} );
