#!/bin/sh
sudo pip install nodeenv --upgrade
nodeenv --node=0.10.29 --npm=1.4.20 --prebuilt venv
rm -r venv/src
. venv/bin/activate
npm install -g mocha@1.20.1
npm install