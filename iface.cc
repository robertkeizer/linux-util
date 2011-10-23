#include <node.h>
#include <v8.h>
#include <fstream>
#include <string.h>

#include <sys/ioctl.h>
#include <net/if.h>
#include <arpa/inet.h>

#include <stdio.h>

using namespace v8;
using namespace node;

static Handle<Value> ListInterfaces( const Arguments& args ){
	HandleScope scope;
	
	char    buf[1024];
	struct	ifconf	ifc;
	struct	ifreq	*ifr;
	int	sck, n_interfaces, i;

	Local<Array> t_return = Array::New( );

	/* Open up a socket.. */
	sck	= socket( AF_INET, SOCK_DGRAM, 0 );
	if( sck < 0 ){
		return t_return;
	}
	
	ifc.ifc_len	= sizeof( buf );
	ifc.ifc_buf	= buf;

	/* Grab the list of interfaces.. or return false if fail. */
	if( ioctl( sck, SIOCGIFCONF, &ifc ) < 0 ){
		return t_return;
	}

	ifr		= ifc.ifc_req;
	n_interfaces	= ifc.ifc_len / sizeof( struct ifreq );

	for( i=0; i<n_interfaces; i++ ){
		struct ifreq *item		= &ifr[i];
		Local<String> interface_name	= String::New( item->ifr_name );
		t_return->Set( Integer::New(i), interface_name );
	}

	return scope.Close( t_return );
} 

static Handle<Value> GetInterfaceDetails( const Arguments& args ){
	HandleScope scope;

	if( args.Length() != 1 ){
		return False();
	}

	v8::String::Utf8Value device_name( args[0]->ToString() );

	int sck, t_index = 0;
	struct ifreq ifr;			/* Make sure that this is the actual structure, not a point like above. */

	struct sockaddr_in sin;

	sck	= socket( AF_INET, SOCK_DGRAM, 0 );
	if( sck < 0 ){
		return False();
	}

	/* Set the ifr structure.. */
	memset( &ifr, 0, sizeof( ifr ) );
	memset( &sin, 0, sizeof( sin ) );
	strncpy( ifr.ifr_name, *device_name, sizeof( ifr.ifr_name ) );	/* Copy the nice name into the structure. */

	/* Verify that the index is valid. ( nice name is valid ) */
	if( ioctl( sck, SIOCGIFINDEX, &ifr ) < 0 ){
		return False();
	}

	/* Define the return object.. */
	Local<Object> t_return = v8::Object::New( );

	/* IPv4 Address */
	if( ioctl( sck, SIOCGIFADDR, &ifr ) >= 0 ){
		memcpy( &sin, &ifr.ifr_addr, sizeof( sin ) );
		t_return->Set( v8::String::New( "ipv4_address" ), v8::String::New( inet_ntoa( sin.sin_addr ) ) );
	}

	if( ioctl( sck, SIOCGIFFLAGS, &ifr ) >= 0 ){
		/* UP */
		if( (ifr.ifr_flags)&IFF_UP ){
			t_return->Set( v8::String::New( "up" ), True() );
		}else{
			t_return->Set( v8::String::New( "up" ), False() );
		}

		/* Running */
		if( (ifr.ifr_flags)&IFF_RUNNING ){
			t_return->Set( v8::String::New( "running" ), True() );
		}else{
			t_return->Set( v8::String::New( "running" ), False() );
		}

	}

	if( ioctl( sck, SIOCGIFHWADDR, &ifr ) >= 0 ){
		char mac[12*3];
		sprintf( mac, "%02x%02x%02x%02x%02x%02x",
			(int)ifr.ifr_hwaddr.sa_data[0],
			(int)ifr.ifr_hwaddr.sa_data[1],
			(int)ifr.ifr_hwaddr.sa_data[2],
			(int)ifr.ifr_hwaddr.sa_data[3],
			(int)ifr.ifr_hwaddr.sa_data[4],
			(int)ifr.ifr_hwaddr.sa_data[5] );


		t_return->Set( v8::String::New( "mac" ), v8::String::New( mac ) );
	}


	return t_return;
} 

static Handle<Value> SetInterfaceDetails( const Arguments& args ){
	HandleScope scope;

	if( args.Length() < 2 ){
		return False( );
	}

	v8::String::Utf8Value device_name( args[0]->ToString( ) );
	v8::String::Utf8Value new_address( args[1]->ToString( ) );
	v8::String::Utf8Value net_mask( args[2]->ToString( ) );

	int t_socket;
	struct ifreq ifr, if_netmask;
	struct sockaddr_in sin, netmask_sin;

	t_socket	= socket( AF_INET, SOCK_DGRAM, 0 );
	if( t_socket < 0 ){
		return False( );
	}

	// Copy the device name into the structure..
	strncpy( ifr.ifr_name, *device_name, sizeof( ifr.ifr_name ) );

	// Set the family of the structure..
	sin.sin_family	= AF_INET;
	
	// Get the correct representation of the ip address
	inet_aton( *new_address, &sin.sin_addr );

	inet_aton( *net_mask, &netmask_sin.sin_addr );
	
	// Copy into the ifr structure
	memcpy( &ifr.ifr_addr, &sin, sizeof( struct sockaddr ) );
	
	int t_result;
	t_result	= ioctl( t_socket, SIOCSIFADDR, &ifr );
	if( t_result < 0 ){
		return False( );
	}else{
		// Set the interface name for the netmask structure..
		strncpy( if_netmask.ifr_name, *device_name, sizeof( if_netmask.ifr_name ) );
		// Set the netmask in the structure
		memcpy( &if_netmask.ifr_netmask, &netmask_sin, sizeof( struct sockaddr ) );
		// Try to set the netmask structure..
		int t_netmask_result;
		t_netmask_result	= ioctl( t_socket, SIOCSIFNETMASK, &if_netmask );
		if( t_netmask_result < 0 ){
			return False( );
		}else{
			return True( );
		}
	}
}

extern "C" void init (Handle<Object> target){
	HandleScope scope;
	
	target->Set( String::New( "list" ), FunctionTemplate::New( ListInterfaces )->GetFunction( ) );
	target->Set( String::New( "get_details" ), FunctionTemplate::New( GetInterfaceDetails )->GetFunction( ) );
	target->Set( String::New( "set_details" ), FunctionTemplate::New( SetInterfaceDetails )->GetFunction( ) );
}
