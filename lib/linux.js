var fs	= require('fs');

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
	var procContents	= fs.readdirSync( "/proc" );
	for( var x=0; x<procContents.length; x++ ){
		if( parseInt( procContents[x] ) ){ 
			// procContents[x] is a pid number..
			returnArray.push( getPidDetails( procContents[x] ) );
		}
	}

	return returnArray;
}

exports.ps.pid	= function( pidToGet ){
	return getPidDetails( pidToGet );
}

function getPidDetails( pidNumber ){
	var returnArray = Array( );
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

	return returnArray;
}

exports.acpi	= function( ){

}

exports.acpi.batteries = function( ){
	var returnArray	= Array( );
	var batteries	= fs.readdirSync( "/proc/acpi/battery/", 'utf8' );
	for( var x=0; x<batteries.length; x++ ){
		var batteryName		= batteries[x];
		returnArray[x]		= new Array( );
	
		var batteryDetails	= getBatteryDetails( batteryName );
		batteryDetails['name']	= batteryName;

		returnArray[x]	= batteryDetails;
	}

	return returnArray;
}

exports.acpi.battery = function( batteryName ){
	return getBatteryDetails( batteryName );
}

function getBatteryDetails( batteryName ){
	var returnArray	= Array( );
	var batteryStateLines	= fs.readFileSync( "/proc/acpi/battery/" + batteryName + "/state", 'utf8' ).split( "\n" );
	for( var x=0; x<batteryStateLines.length; x++ ){
		var tmpSplit	= batteryStateLines[x].split( ":" );
		if( tmpSplit.length > 1 ){
			var tmpKey		= tmpSplit[0].replace( RegExp( " " ), "_" ).trim( );
			returnArray[tmpKey]	= tmpSplit[1].trim( );
		}
	}

	return returnArray;
}
