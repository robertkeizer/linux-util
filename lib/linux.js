var fs		= require('fs');
var path	= require('path');
var sys		= require('sys');

exports.mounts = function( ){
	var returnObj = Array( );
	var currentMounts	= fs.readFileSync( "/etc/mtab", 'utf8' ).replace( RegExp( '\n$' ), '' ).split( "\n" );
	for( var x=0; x<currentMounts.length; x++ ){
		var currentMountParts	= currentMounts[x].split( " " );
		returnObj[x]		= new Array( );
		returnObj[x].device	= currentMountParts[0];		// This dot is ugly, and could potentially cause problems.
		returnObj[x].mountpoint	= currentMountParts[1].replace( RegExp( '.040' ), ' ' );
		returnObj[x].fs		= currentMountParts[2];
		returnObj[x].options	= currentMountParts[3];
	}
	
	return returnObj;
}

exports.ps = function( ){
	var returnArray	= Array( );
	try{
		var procContents	= fs.readdirSync( "/proc" );
		for( var x=0; x<procContents.length; x++ ){
			// This isn't the best way of doing this.. but it works for now.
			if( parseInt( procContents[x] ) ){ 
				// procContents[x] is a pid number..
				returnArray.push( getPidDetails( procContents[x] ) );
			}
		}
	}catch( err ){
		return false;
	}

	return returnArray;
}

exports.ps.pid	= function( pidToGet ){
	return getPidDetails( pidToGet );
}

function getPidDetails( pidNumber ){
	var returnArray = Array( );
	try{
		var statusLines	= fs.readFileSync( "/proc/" + pidNumber + "/status", 'utf8').split( "\n" );
		for( var x=0; x<statusLines.length; x++ ){
			var tmpSplit		= statusLines[x].split( ":" );
			// This if statement takes care of trailing \n's
			if( tmpSplit.length > 1 ){
				var tmpKey		= tmpSplit[0].toLowerCase( );
				// The status gives more number than we care about, seperated by tabs.. remove them.
				if( tmpKey == 'uid' || tmpKey == 'gid' ){
					returnArray[tmpKey]	= tmpSplit[1].trim().replace( RegExp( "\t.*" ), '' );
				}else{
					returnArray[tmpKey]	= tmpSplit[1].trim( );
				}
			}
		}
		
		var cmdLine	= fs.readFileSync( "/proc/" + pidNumber + "/cmdline", 'utf8' ).replace( RegExp( "\u0000" ), " " ).replace( RegExp( " .*" ), "" );

		if( cmdLine == "" ){
			cmdLine = false;
		}
		returnArray['cmdline']	= cmdLine;

	}catch( err ){
		return false;
	}

	return returnArray;
}

exports.acpi	= function( ){ }

exports.acpi.batteries = function( ){
	var returnArray	= Array( );
	try{
		var batteries	= fs.readdirSync( "/proc/acpi/battery/", 'utf8' );
		for( var x=0; x<batteries.length; x++ ){
			var batteryName		= batteries[x];
			var batteryDetails	= getBatteryDetails( batteryName );
			batteryDetails['name']	= batteryName;

			returnArray[x]	= new Array( );
			returnArray[x]	= batteryDetails;
		}
	}catch( err ){
		return false;
	}

	return returnArray;
}

exports.acpi.battery = function( batteryName ){
	return getBatteryDetails( batteryName );
}

function getBatteryDetails( batteryName ){
	var returnArray	= Array( );
	try{ 
		var batteryStateLines	= fs.readFileSync( "/proc/acpi/battery/" + batteryName + "/state", 'utf8' ).split( "\n" );
		for( var x=0; x<batteryStateLines.length; x++ ){
			var tmpSplit	= batteryStateLines[x].split( ":" );
			if( tmpSplit.length > 1 ){
				var tmpKey		= tmpSplit[0].replace( RegExp( " " ), "_" ).trim( );
				returnArray[tmpKey]	= tmpSplit[1].trim( );
			}
		}
	}catch( err ){
		return false;
	}

	return returnArray;
}

exports.sysctl	= function( recursiveDir ){
	// Start the chain if simply sysctl() was called..
	if( !recursiveDir ){ recursiveDir = "/proc/sys/"; };
	
	var returnObj	= function( ){ };
	
	function makeSafeName( unsafeName ){
		if( typeof unsafeName == 'undefined' ){ return unsafeName; };
		return unsafeName	.replace( RegExp( '-', 'g' ), '_' )
					.replace( RegExp( '0', 'g' ), 'zero' )
					.replace( RegExp( '1', 'g' ), 'one' )
					.replace( RegExp( '2', 'g' ), 'two' )
					.replace( RegExp( '3', 'g' ), 'three' )
					.replace( RegExp( '4', 'g' ), 'four' )
					.replace( RegExp( '5', 'g' ), 'five' )
					.replace( RegExp( '6', 'g' ), 'six' )
					.replace( RegExp( '7', 'g' ), 'seven' )
					.replace( RegExp( '8', 'g' ), 'eight' )
					.replace( RegExp( '9', 'g' ), 'nine' )
					.replace( RegExp( '/', 'g' ), '_' );
	}

	function makeSafeContent( unsafeContent ){
		if( typeof unsafeContent == 'undefined' ){ return unsafeContent; };
		return unsafeContent.replace( RegExp( '\n', 'g' ), '' ).replace( '|', '' ).replace( "'", "\'" );
	}

	try{
		var contentsOfDir	= fs.readdirSync( recursiveDir, 'utf8' );
		contentsOfDir.forEach( function( name ){
			var tmpStatObj	= fs.statSync( path.join( recursiveDir, name ) );
			if( tmpStatObj.isDirectory() ){
				returnObj[makeSafeName(name)]	= exports.sysctl( path.join( recursiveDir, name ) );
			}else{
				var safeFileName	= makeSafeName( name );
				Object.defineProperty( returnObj, safeFileName,
					{ get: function( ){
						return makeSafeContent( fs.readFileSync( path.join( recursiveDir, name ), 'utf8' ) )
					}, set: function(c){
						// Cannot use fs.writeFileSync, as file descriptors are shot..
						// This is not the proper way to do this either thoguh..
						fs.createWriteStream( path.join( recursiveDir, name ) ).end( c );
						return true;
					}, configurable: true
				} );
			}
		} );

		return returnObj;
	}catch( err ){
		//console.log( "ERROR: " + err );
		return false;
	}
}
