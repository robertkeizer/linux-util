#include <node.h>
#include <v8.h>
#include <fstream>

#include <sys/ioctl.h>
#include <net/if.h>
#include <arpa/inet.h>

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

extern "C" void init (Handle<Object> target){
	HandleScope scope;
	
	target->Set( String::New( "list" ), FunctionTemplate::New( ListInterfaces )->GetFunction( ) );
}
