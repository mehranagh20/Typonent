#!/bin/bash

curl --data "username=$1&password=$2&email=$3" http://localhost:8000/register/
