#!/bin/bash

num=0

if [ ! -z $1 ]; then
    num=$1
fi

echo $num

curl "localhost:8000/upcomingComps/$num"
