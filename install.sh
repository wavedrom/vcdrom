#!/bin/bash

if [[ "$OSTYPE" == "" ]]; then
    echo "Not supported on this OS"
    exit 1
fi 

if [ "_${FS_ROOTDIR}" == "_" ]
then
    echo "Environment Variable FS_ROOTDIR does not exist"
    echo "This should point to the parent of the SiFive folder"
    exit 1
fi

if [ ! -d ${FS_ROOTDIR} ]
then
    echo "Folder pointed to by FS_ROOTDIR does not exist"
    echo "==> ${FS_ROOTDIR}"
    echo "This should point to the parent of the SiFive folder"
    exit 1
fi

target_dir_glob="${FS_ROOTDIR}/SiFive/http*"
files=(${target_dir_glob})

if [ "${files[0]}" == "${target_dir_glob}" ]
then
    dev_root_target=${FS_ROOTDIR}/SiFive/http-server-1.0.0.0000
    mkdir ${dev_root_target}
else 
    dev_root_target=${files[0]}
fi

workspace=${FS_WS}
if [ "_${workspace}" == "_" ] 
then
    echo "You must set FS_WS to be the workspace root of your FS session"
    echo "Use either:"
    echo "  $ export FS_WS=<path-to-workspace>"
    echo "  $ ./install.sh"
    echo "or:"
    echo "  $ FS_WS=<path-to-workspace> ./install.sh"
    exit 1
fi

echo "WS: ${workspace}"
echo "DR: ${dev_root_target}"
echo "Building..."
./build.sh
./node_modules/.bin/pkg lib/http-server-relay.js

echo "Copying..."
cp -r app/* ${workspace} && cp -r app/* ${dev_root_target}/app/

if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    killall -w http-server-relay-linux || true
    if [[ $(grep -i Microsoft /proc/version) ]]; then
        cp http-server-relay-win.exe ${dev_root_target}/bin
    else
        cp http-server-relay-linux ${dev_root_target}/bin
    fi
    
elif [[ "$OSTYPE" == "darwin"* ]]; then
    # Mac OSX
    cp http-server-relay-macos ${dev_root_target}/bin
else
    # Windows.
    cp http-server-relay-win.exe ${dev_root_target}/bin
fi