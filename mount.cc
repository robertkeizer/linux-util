#include <node.h>
#include <v8.h>
#include <sys/mount.h>
#include <fstream>

using namespace v8;
using namespace node;

static Handle<Value> Mount ( const Arguments& args ){
	HandleScope scope;

	if( args.Length() < 3 || 
		!args[0]->IsString() ||
		!args[1]->IsString() ||
		!args[2]->IsString() ){
		return False();
	}

	v8::String::Utf8Value device( args[0]->ToString() );
	v8::String::Utf8Value path( args[1]->ToString() );
	v8::String::Utf8Value format( args[2]->ToString() );

	int mountReturn = mount( *device, *path, *format, MS_MGC_VAL, NULL );

	if( mountReturn == -1 ){
		return False();
	}
	std::ofstream etc_mtab( "/etc/mtab", std::ios::app );
	etc_mtab << *device << " " << *path << " " << *format << " rw 0 0" << std::endl;
	etc_mtab.close();

	return True();
}

extern "C" void init (Handle<Object> target){
	HandleScope scope;
	
	target->Set( String::New( "mount" ), FunctionTemplate::New( Mount )->GetFunction() );
}
