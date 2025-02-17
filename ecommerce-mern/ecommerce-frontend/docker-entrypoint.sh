#!/bin/sh

# Replace the placeholder in env.js with the actual value of the BACKEND_URL environment variable
sed -i "s|\${BACKEND_URL}|$BACKEND_URL|g" /usr/share/nginx/html/assets/env.js

# Start Nginx using the passed command arguments
exec "$@"