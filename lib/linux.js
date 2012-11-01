var fs			= require( 'fs' );
var path		= require( 'path' );

exports.ps = function( pid, cb ){
	// Handle if only a cb was passed.. ie shuffle.
	if( pid instanceof Function && cb == null ){
		cb	= pid;
		pid	= null;
	}

	// If only a single pid was specified.. 
	if( pid ){
		get_pid_details( pid, function( err, details ){
			if( err ){
				cb( err );
			}
			cb( null, details );
		} );
		return
	}

	// Define the return array..
	var return_array	= Array( );

	// Async read /proc
	fs.readdir( "/proc", function( _err, files ){

		// Can't open proc?
		if( _err ){
			return cb( _err );
		}

		// Iterate through the contents of /proc.
		files.forEach( function( item, index ){
			
			// Make sure to be able to parse the int.. if we can't
			// then its not a process directory..
			if( parseInt( item ) ){

				// Get the pid details
				get_pid_details( item, function( err, details ){

					// Error out if we couldn't get the details of a pid.
					if( err ){
						return cb( err );
					}

					// Push the details to the return array.
					return_array.push( details );

					// Check if this is the last item in /proc.. if it is, call the cb.
					if( index == files.length-1 ){
						return cb( null, return_array );
					}
				} );
			}
		} );
	} );
}

function get_pid_details( pid, cb ){
	var return_obj	= { };
	fs.readFile( "/proc/" + pid + "/status", "utf8", function( err, data ){
		if( err ){
			return cb( err );
		}
	
		// Splite the data by newlines.
		var status_lines	= data.split( "\n" );

		// Iterate through all the status lines.
		status_lines.forEach( function( val, index ){

			// Split by ":". Note that we don't care if there is more than one ":".. 
			var t_split = val.split( ":" );

			// This should always execute, but just to be on the safe side.
			if( t_split.length > 1 ){
				t_key			= t_split[0].toLowerCase( );
				return_obj[t_key]	= t_split[1].trim( );
			} 

			// Check to see if this is the last status line.
			// If it is, cb with the return obj.
			if( index == status_lines.length-1 ){
				return cb( null, return_obj );
			}
		} );
	} );
}
