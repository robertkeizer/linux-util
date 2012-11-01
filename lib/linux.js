var fs			= require( 'fs' );
var path		= require( 'path' );

exports.ps = function( pid ){
	if( pid ){
		return get_pid_details( pid );
	}

	var return_array	= Array( );
	try{
		proc_contents	= fs.readdirSync( "/proc" );

		proc_contents.forEach( function( val, index ){
			if( parseInt( val ) ){
				return_array.push( get_pid_details( val ) );
			}
		} );

	}catch( err ){
		return false;
	}

	return return_array;
}

function get_pid_details( pidNumber ){
	var return_obj	= { };
	try{
		var status_lines	= fs.readFileSync( "/proc/" + pidNumber + "/status", 'utf8').split( "\n" );
		status_lines.forEach( function( val ){
			t_split	= val.split( ":" );
			if( t_split.length > 1 ){
				t_key			= t_split[0].toLowerCase( );
				return_obj[t_key]	= t_split[1].trim( );
			} 
		} );
	}catch( err ){
		return false;
	}

	return return_obj;
}
