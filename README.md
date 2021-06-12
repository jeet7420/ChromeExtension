#

## emscripten setup

.bash_profile
``` 
function emsdk_start(){
	export EMSDK=/path/to/emsdk
	export EM_CONFIG=$EMSDK/.emscripten
	export EMSCRIPTEN=$EMSDK/upstream/emscripten
	export EM_CACHE=$EMSCRIPTEN/cache
	export EMSDK_NODE=$EMSDK/node/12.18.1_64bit/bin/node
	export EMSDK_PYTHON=$EMSDK/python/3.7.4_64bit/bin/python3
	export PATH=$PATH:$EMSDK:$EM_CONFIG:$EM_CACHE:$EMSDK_NODE:$EMSDK_PYTHON:$EMSCRIPTEN:$OpenBLAS_HOME:$OpenBLAS_DIR
	source "$EMSDK/emsdk_env.sh"
        echo -e "done"
}
```
emsdk_start

## build cmsn.wasm

``` cd .
sh chrome/install-sdk.sh
```
