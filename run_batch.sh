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
git pull
rsync -au --exclude='.git' ./* ../chartHN_tmp/data/
git checkout master
rsync -au ../chartHN_tmp/. ./ # dot. to cp hidden files

node --experimental-default-type=module --env-file=.env batch.js $per_page $page

bash git_to_data_branch.sh