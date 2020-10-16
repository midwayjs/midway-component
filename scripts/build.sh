#!/bin/bash
set -e

lerna run build
lerna exec -- rm -rf ./dist/.mwcc-cache
