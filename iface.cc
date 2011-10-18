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

	return t_return;
} 
	

extern "C" void init (Handle<Object> target){
	HandleScope scope;
	
	target->Set( String::New( "list" ), FunctionTemplate::New( ListInterfaces )->GetFunction( ) );
	target->Set( String::New( "get_details" ), FunctionTemplate::New( GetInterfaceDetails )->GetFunction( ) );
}
