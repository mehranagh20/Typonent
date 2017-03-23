#!/bin/bash

num=0
if [ ! -z $1 ]; then
    num=$1
fi

curl "localhost:8000/pastComps/$num"
