#include <node.h>
#include <v8.h>
#include <sys/mount.h>
#include <fstream>

using namespace v8;
using namespace node;

/*
* Just a note that these functions do not append and remove
* lines from /etc/mtab. That is done in the javascript.
* These are very very simple mount() and umount() calls.
*/

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

	return True();
}

static Handle<Value> UMount ( const Arguments& args ){
	HandleScope scope;
	
	if( args.Length() < 1 || !args[0]->IsString() ){
		return False();
	}

	v8::String::Utf8Value path( args[0]->ToString() );
	
	int umount_return	= umount( *path );
	if( umount_return == -1 ){
		return False( );
	}
	return True( );
}

extern "C" void init (Handle<Object> target){
	HandleScope scope;
	
	target->Set( String::New( "mount" ), FunctionTemplate::New( Mount )->GetFunction() );
	target->Set( String::New( "umount" ), FunctionTemplate::New( UMount )->GetFunction() );
}
