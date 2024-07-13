#! /bin/bash

if [ ! -d "./node_modules" ]
then
    echo "Installing dependencies..."
    npm install
    echo "Installation done!" 
fi

node index.js