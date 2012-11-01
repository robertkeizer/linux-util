Utilities for linux written in javascript.

Examples
========

ps
--
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

mount / umount
--------------

	var util	= require( "util" );
	var linux	= require( "linux-util" );

	// Note that umount is inside of the mount callback because
	// otherwise umount could be called first.
	
	linux.mount( "/dev/sdb1", "/mnt/tmp", "ntfs", function( err, res ){
		if( err ){
			util.log( "Was unable to mount!" );
		}else{
			util.log( "Mounted!" );
	
			linux.umount( "/mnt/tmp", function( _err ){
				if( _err ){
					util.log( "Couldn't umount." );
					util.log( "You should most likely manually do a umount." );
				}else{
					util.log( "Umounted." );
				}
			} );
		}
	} );
