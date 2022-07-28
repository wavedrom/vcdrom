#!/bin/bash

# This script will build and install vcdrom, vcdParse, and http-server-relay into a developement 
# environment.  For Linux and MacOS you can simply run the script as described below.
#
# For Windows you need to run this script under WSL2 Ubuntu.  To make this work you need
# to install the mingw-w64 build environment once:
#
# sudo apt install mingw-w64
#
# The script will detect that you are in a WSL environment and build the Windows execuables for vcdParse
#
# This script require two environment variables be defined:
#
# FS_WS is the path to the workspace you are using for the FS AUT (application under test).
# FS_ROOTDIR is the path the parent folder of your dev-root/SiFive folder.
#
# For instance:
#
# WSL2 Ubuntu (you can put this in ~/.bashrc):
#    FS_WS=/mnt/c/eclipse/eclipse-2022.03-rcp/runtime-freedom-studio
#    FS_ROOTDIR=/mnt/c/dev-root
#
# Ubuntu (you can put this in ~/.bashrc):
#    export FS_WS=/home/kevinm/sifive/ws-multitap
#    export FS_ROOTDIR=/home/kevinm/dev-root
#
# MacOS (you can put this in ~/.zprofile):
#    export FS_WS=/Users/kevin/fs-dev-x86
#    export FS_ROOTDIR=/Users/kevin/dev-root
#
# The FS_WS path allows the webapp to be installed to AUT workspace and be used without having to 
# restart Freedom Studio
#
# RUNNING THE SCRIPT
#
# If you run the script with no parameters only the vcdrom webapp will be built and installed.  
# This is great if you are working on webapp code and builds faster than doing everything
#
# Options to the script:
#
#   -v build and install vcdrom
#   -s build and install http-server-relay
#   -p build and install vcdparse
#   -a build and install everything



doServer=false
doParser=false
doWebapp=false

# Build vcdom only if no cmd line params are given
if [ "$#" -eq 0 ]; then
    doWebapp=true
fi

while getopts savp flag
do
    case "${flag}" in
        s) 
            doServer=true ;;
        v) 
            doWebapp=true ;;
        p) 
            doParser=true ;;
        a) 
            doServer=true
            doParser=true
            doWebapp=true
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
            CROSS=i686-w64-mingw32- make clean standalone
            echo "Installing vcdParse..."
            cp vcdParse.exe ${dev_root_target}/bin
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

