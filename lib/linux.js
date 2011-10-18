var fs			= require( 'fs' );
var path		= require( 'path' );
var mnt_lib		= require( './default/mount' );
var iface_lib		= require( './default/iface' );

exports.mount = function( device, path, format ){
	if( !mnt_lib.mount( device, path, format ) ){
		return false;
	}

	// append to mtab.
	t_handle	= fs.openSync( "/etc/mtab", "a", 666 );
	t_string	= device + " " + path + " " + format + " rw 0 0\n";
	fs.writeSync( t_handle, t_string, null );
	fs.close( t_handle );
	return true;
}

exports.umount = function( pth ){
	if( !mnt_lib.umount( pth ) ){
		return false;
	}

	t_content	= "";
	t_found		= false;
	fs.readFileSync( "/etc/mtab" ).toString( ).split( "\n" ).reverse().forEach( function( line ){
		// discard blank line due to split.
		if( line == '' ){ return; }

		// skip the last occurrence of $pth in mtab. ( first since .reverse() is called. )
		if( line.indexOf( pth ) > 0 && !t_found ){ t_found=true; return; }

		// Add all the other lines that already exist..
		t_content	+= line + "\n";
	} );

	fs.writeFileSync( "/etc/mtab", t_content, 'utf8' );
	return true;
}

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

exports.sysctl = function( key, val ){
	function t_recurse( t_dir, t_obj ){
		if( !t_obj && typeof( t_obj ) == 'undefined' ){
			t_obj	= { };
		}

		t_content	= fs.readdirSync( t_dir );
		t_content.forEach( function( val ){
			t_path	= path.join( t_dir, val );
			t_stat	= fs.statSync( t_path );
			if( t_stat.isDirectory( ) ){
				t_obj[val] = t_recurse( t_path );
			}else{
				try{
					t_content	= fs.readFileSync( t_path, 'utf8' ).trim();
					if( t_content.match( RegExp( "\t" ) ) ){
						t_content	= t_content.split( "\t" );
					}
					t_obj[val] 	= t_content;
				}catch( err ){
					t_obj[val]	= err;
				}
			}
		} );
		return t_obj;
	}

	if( ( !key && typeof( key ) == 'undefined' ) && ( !val && typeof( val ) == 'undefined' ) ){
		return t_recurse( "/proc/sys" );
	}else if( !val && typeof( val ) == 'undefined' ){
		t_key_path	= path.join( "/proc/sys/", key.replace( RegExp( "\\.", "g" ), "/" ) );
		try{
			return fs.readFileSync( t_key_path, 'utf8' ).trim();
		}catch(err){
			return false;
		}
	}else{
		// set key to val.
		t_key_path	= path.join( "/proc/sys/", key.replace( RegExp( "\\.", "g" ), "/" ) );

		// similar to echo 1 > /proc/sys/net/ip.. since we cannot stat some files in /proc.
		t_write_stream	= fs.createWriteStream( t_key_path );
		t_write_stream.end( val, 'utf8' );
		t_write_stream.on( 'error', function( exp ){ /* do nothing */ } );

		return true;
	}
}

exports.interfaces	= {
	'list': function( ){
			t_interfaces	= iface_lib.list();
			if( !t_interfaces ){
				return [ ];
			}
			return t_interfaces;
		}
};
