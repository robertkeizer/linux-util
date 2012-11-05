var fs			= require( 'fs' );
var path		= require( 'path' );

var _mount		= require( '../build/Release/mount' );
var mount		= _mount.mount;
var umount		= _mount.umount;

var _ifconfig		= require( '../build/Release/ifconfig' );
var set_ipv4_address	= _ifconfig.set_ipv4_address;

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

	// Async read /proc
	fs.readdir( "/proc", function( _err, files ){

		// Can't open proc?
		if( _err ){
			return cb( _err );
		}

		// Define the return array.
		var return_array	= Array( );

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

					// This if statement needs to be inside the get_pid_details cb 
					// because get_pid_details is also truely async ( fs.readfile ).
					if( index == (files.length-1) ){
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

exports.mount = function( from, to, format, cb ){
	// If the callback isn't defined, figure out where it is.
	if( !cb ){
		// Check to and format.
		if( format ){
			return format( "Invalid call to mount." );
		}

		if( to ){
			return to( "Invalid call to mount." );
		}

		// mount was called with a cb only. Show all current mounts here..
		if( from ){
			cb	= from;
			from	= null;
			to	= null;
			format	= null;
		}
	}

	// Figure out if we're actually mounting something or not.
	if( from ){
		// Mount using from, to, and format.
		try{
			if( mount( from, to, format ) ){
				// Successfully mounted the filesystem.	

				// Generate the new mtab line.
				// Note that right now this is simply hardcoded rw and 0 0.. 
				var mtab_line	= from + " " + to + " " + format + " rw 0 0\n"

				// Append it to the mtab file.
				fs.appendFile( "/etc/mtab", mtab_line, "utf8", function( err ){
						if( err ){
							return cb( "Couldn't update mtab." );
						}
						return cb( null, true );
				} );
			}else{
				return cb( true );
			}
		}catch( err ){
			return cb( err );
		}
	}else{
		// Show current mounts..
		fs.readFile( "/etc/mtab", "utf8", function( err, res ){

			// Error out if we can't read /etc/mtab.
			if( err ){
				return cb( err );
			}

			var return_array	= [ ];
			
			// Split the mtab by newlines.
			var mount_lines	= res.split( "\n" );

			// Iterate through all the lines in the mtab.
			mount_lines.forEach( function( mount_line ){

				if( mount_line == "" ){
					return;
				}

				// Splitting by space is valid since mtab replaces literal spaces as \040's 
				var mount_line_parts	= mount_line.split( " " );

				var device	= mount_line_parts[0];
				var dir		= mount_line_parts[1];
				var fs		= mount_line_parts[2];
				var _options	= mount_line_parts[3].split(",");

				// Iterate through the options again to provive key value pairs for 
				// options such as uid=1000, etc.
				var options	= [ ];
					
				_options.forEach( function( option, x ){
					var option_split	= option.split( "=" );

					// Hardcode only 2.. we don't care about multiple ='s.. haven't seen any implementations such as that.
					if( option_split.length == 2 ){
						var tmp_obj	= [ ]
						tmp_obj[option_split[0]]	= option_split[1];

						options.push( tmp_obj );
					}else{
						options.push( option );
					}
				} );

				return_array.push( { "device": device, "directory": dir, "filesystem": fs, "options": options } );
			} );

			return cb( null, return_array );
		} );
	}
}	

exports.umount	= function( what, cb ){

	// Didn't specify what or cb.. just return..
	// do nothing.
	if( !what && !cb ){
		return;
	}

	if( !cb && what && what instanceof Function ){
		// No what, just cb.
		return what( true );
	}else if( !cb && what && ! (what instanceof Function ) ){
		// what, no cb.

		// Just define a function that can be used as cb.
		cb = function( ){ };
	}

	// Try and unmount..
	if( umount( what ) ){
		// Successfull umount.

		// Rewrite the /etc/mtab file 
		fs.readFile( "/etc/mtab", "utf8", function( err, res ){
			if( err ){
				return cb( "Couldn't open mtab for reading." );
			}
			
			// Define the new mtab contents variable.
			var new_mtab_contents	= "";

			// Split the mtab by lines.. match against 'what'.
			var mtab_lines	= res.split( "\n" );
			mtab_lines.forEach( function( mtab_line ){
			
				// This is so that the trailing newline ( blankline ) doesn't get
				// append to, along with yet another newline further down.
				if( mtab_line == "" ){
					return;
				}

				// Split into parts..
				var mtab_line_parts	= mtab_line.split( " " );

				// Match either the device or the directory ( exactly ).
				if( mtab_line_parts[0] == what || mtab_line_parts[1] == what ){
					return;
				}
				
				new_mtab_contents	+= mtab_line + "\n";
			} );

			// Now write the new mtab content..
			fs.writeFile( "/etc/mtab", new_mtab_contents, "utf8", function( _err ){
				if( _err ){
					return cb( "Unable to write the mtab: " + _err );
				}
				return cb( false );
			} );

		} ); // end of readFile ( /etc/mtab ).
	}else{
		// Error occurred.. 
		return cb( true );
	}
}

exports.ifconfig = function( options, cb ){
	// Handle the options object.. 
	
	// use _set_ipv4_address if its required.. 

	return cb( null, null );
}
