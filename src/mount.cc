#include <node.h>
#include <v8.h>
#include <sys/mount.h>
#include <fstream>

using namespace v8;
using namespace node;

static Handle<Value> _mount ( const Arguments& args ){
	HandleScope scope;
	
	if( args.Length() < 3 ){
		return v8::ThrowException( v8::String::New( "Not enough arguments" ) );
	}
	
	if( !args[0]->IsString() || !args[1]->IsString() || !args[2]->IsString() ){
		return v8::ThrowException( v8::String::New( "All arguments must be of type string!" ) );
	}
	
	v8::String::Utf8Value what( args[0]->ToString( ) );
	v8::String::Utf8Value where( args[1]->ToString( ) );
	v8::String::Utf8Value format( args[2]->ToString( ) );

	int mount_return = mount( *what, *where, *format, MS_MGC_VAL, NULL );
	
	if( mount_return == -1 ){
		return False();
	}
	
	return True();
}

static Handle<Value> _umount ( const Arguments& args ){
	HandleScope scope;
	
	if( args.Length() != 1 ){
		return v8::ThrowException( v8::String::New( "Only 1 argument is allowed." ) );
	}

	v8::String::Utf8Value what( args[0]->ToString( ) );

	int umount_return = umount( *what );

	if( umount_return == -1 ){
		return False();
	}
	
	return True();
}

extern "C" void init (Handle<Object> target){
	HandleScope scope;

	target->Set( String::New( "mount" ), FunctionTemplate::New( _mount )->GetFunction( ) );
	target->Set( String::New( "umount" ), FunctionTemplate::New( _umount )->GetFunction( ) );
}
