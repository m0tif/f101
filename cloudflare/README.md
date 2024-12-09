# cloudflare scripts

Scripts for deploying and managing workers and dns in cloudflare

## structure

This script runs all scripts matching `../*/routes.js`. Each script should return a list of string paths for which the worker should be executed.
