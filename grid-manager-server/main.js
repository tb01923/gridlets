const fs = require('fs')
    , path = require('path')
    , {map, pipe} = require('ramda')

const gridManagerApi = require('./lib/grid-manager-api')

// String -> [String]
const fileList = function(dir) {
    return fs.readdirSync(dir).reduce(function(list, file) {
        var name = path.join(dir, file);
        var isDir = fs.statSync(name).isDirectory();
        return list.concat(isDir ? fileList(name) : [name]);
    }, []);
}

// [String] ->  [Gridlet]
const requireGridlets = map((src) => {
    return require(`${process.cwd()}/${src}`)
})

module.exports.start = function(gridletsPath, options){

    if(!gridletsPath) {
        throw "Configuration is not defined";
    }

    // Set Zookeeper connection string to global scope
    global.zookeeperConn = options.zookeeperConn || "localhost:2181";

    const runGridlets = pipe(
        requireGridlets,
        map(gridManagerApi.execute)
    )

    const gridletSrc = fileList(gridletsPath)
    const gridlets = runGridlets(gridletSrc)
}
