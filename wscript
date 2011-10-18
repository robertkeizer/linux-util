srcdir = "."
blddir = "lib"

def set_options(opt):
    opt.tool_options("compiler_cxx")

def configure(conf):
    conf.check_tool("compiler_cxx")
    conf.check_tool("node_addon")

def build(bld):
    obj = bld.new_task_gen("cxx", "shlib", "node_addon")
    obj.target = "mount"
    obj.source = "mount.cc"
    obj.linkflags = ['']
    
    obj = bld.new_task_gen("cxx", "shlib", "node_addon")
    obj.target = "iface"
    obj.source = "iface.cc"
    obj.linkfalgs = [ '' ]
