#!/bin/bash
set -e

lerna exec -- rm -rf ./dist
lerna run build --concurrency=4
