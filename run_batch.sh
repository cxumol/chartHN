#!/bin/bash

# Set default values
per_page=1
page=1

# Check if arguments are provided and are numbers
if [ $# -ge 1 ] && [[ "$1" =~ ^[0-9]+$ ]]; then
  per_page=$1
fi

if [ $# -ge 2 ] && [[ "$2" =~ ^[0-9]+$ ]]; then
  page=$2
fi

mkdir -p ../chartHN_tmp/data
git checkout data
rsync -av data/ ../chartHN_tmp/data
git checkout master
cp -aru ../chartHN_tmp/ ./
cp ../chartHN_tmp/.env ./

node --experimental-default-type=module --env-file=.env batch.js $per_page $page

bash git_to_data_branch.sh