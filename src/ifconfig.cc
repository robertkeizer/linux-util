#include <node.h>
#include <v8.h>
#include <sys/mount.h>
#include <fstream>

#include <sys/ioctl.h>
#include <net/if.h>
#include <arpa/inet.h>

using namespace v8;
using namespace node;

static Handle<Value> _set_ipv4_address ( const Arguments* args ){
	HandleScope scope;
	
	v8::String::Utf8Value device( args[0]->ToString( ) );
	v8::String::Utf8Value address( args[1]->ToString( ) );
	v8::String::Utf8Value mask( args[2]->ToString( ) );
	
	int t_socket;
	struct ifreq ifr, if_netmask;
	struct sockaddr_in sin, netmask_sin;
	
	t_socket	= socket( AF_INET, SOCK_DGRAM, 0 );
	if( t_socket < 0 ){
		return False( );
	}
	
	strncpy( ifr.ifr_name, *device_name, sizeof( ifr.ifr_name ) );
	sin.sin_family	= AF_INET;
	
	inet_aton( *new_address, &sin.sin_addr );
	inet_aton( *net_mask, &netmask_sin.sin_addr );
	
	memcpy( &ifr.ifr_addr, &sin, sizeof( struct socketaddr ) );

	int t_result;
	t_result	= ioctl( t_socket, SIOCSIFADDR, &ifr );
	if( t_result < 0 ){
		return False( );
	}
	
	strncpy( if_netmask.ifr_name, *device_name, sizeof( if_netmask.ifr_name ) );
	memcpy( &if_netmask.ifr_netmask, &netmask_sin, sizeof( struct sockaddr ) );
	
	int t_netmask_result;
	t_netmask_result = ioctl( t_socket, SIOCSIFNETMASK, &if_netmask );
	if( t_netmask_result < 0 ){
		return False( );
	}else{
		return True( );
	}
}


extern "C" void init (Handle<Object> target){
	HandleScope scope;

	target->Set( String::New( "set_ipv4_address" ), FunctionTemplate::New( _set_ipv4_address )->GetFunction( ) );
}
