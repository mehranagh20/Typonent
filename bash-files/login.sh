#!/bin/bash

curl --cookie ./somefile --data "email=$1&password=$2" --cookie-jar ./somefile http://localhost:8000/login/
