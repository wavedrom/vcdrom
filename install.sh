#!/bin/bash

doServer=false
doParser=false
doWebapp=true
while getopts sap flag
do
    case "${flag}" in
        s) 
            doServer=true ;;
        p) 
            doParser=true ;;
        a) 
            doServer=true
            doParser=true
            ;;
    esac
done

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

if [ ! -d "${FS_ROOTDIR}" ]
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

if [ "${doWebapp}" == "true" ]
then
    echo "Building vcdrom web app..."
    ./build.sh

    echo "Installing web app..."
    cp -r app/* ${workspace} 
    cp -r app/* ${dev_root_target}/app/
fi

if [ "${doServer}" == "true" ]
then
    echo "Building http-server-relay..."
    ./node_modules/.bin/pkg lib/http-server-relay.js

    echo "Installing http-server-relay"

    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if [[ $(grep -i Microsoft /proc/version) ]]; then
            # WSL Build
            cp http-server-relay-win.exe ${dev_root_target}/bin
        else
            # Linux build
            killall -w http-server-relay-linux || true
            cp http-server-relay-linux ${dev_root_target}/bin
        fi
        
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # Mac OSX
        killall http-server-relay-macos || true
        cp http-server-relay-macos ${dev_root_target}/bin
    else
        # Windows.
        echo "Build is not working in Windows yet!"
        echo "You WSL2 Ubuntu instead."
        exit 1
    fi
fi

if [ "${doParser}" == "true" ]
then
    echo "Building vcdParse..."
    cd vcdparse
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if [[ $(grep -i Microsoft /proc/version) ]]; then
            # WSL Build
            echo "!!!"
            echo "!!! VCDPARSE: Waiting for CROSS build support to do Windows..."
            echo "!!!"
            # CROSS=i686-w64-mingw32- make clean standalone
            # echo "Installing vcdParse..."
            # cp vcdParse.exe ${dev_root_target}/bin
        else
            # Linux build
            make clean standalone python
            echo "Installing vcdParse..."
            cp vcdParse vcdParser.py _vcdParser.so ${dev_root_target}/bin
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # Mac OSX
        make clean standalone python
        echo "Installing vcdParse..."
        cp vcdParse vcdParser.py _vcdParser.so ${dev_root_target}/bin
    else
        # Windows.
        echo "Build is not working in Windows yet!"
        echo "You WSL2 Ubuntu instead."
        exit 1
    fi
    cd ..
fi
