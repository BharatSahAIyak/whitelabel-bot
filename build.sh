#!/bin/sh

if [[ "$OSTYPE" == "darwin"* ]]; then
  grep -rlE '12\\.1\\.6|17\\.0\\.2' .next/static/chunks | xargs sed -i '' 's/12\\.1\\.6/xx.xx.xx/g; s/17\\.0\\.2/xx.xx.xx/g'
else
  grep -rlE '12\\.1\\.6|17\\.0\\.2' /app/.next/static/chunks | xargs sed -i 's/12\\.1\\.6/xx.xx.xx/g; s/17\\.0\\.2/xx.xx.xx/g'
fi