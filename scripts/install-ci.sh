#!/bin/bash

# A bash script for handling npm install with proxy fallbacks and diagnostic checks

# Function for checking if commands exist
command_exists() {
    command -v "$1" > /dev/null 2>&1
}

# Function to run npm install with proxy
npm_install_with_proxy() {
    if [[ -n "$HTTP_PROXY" ]]; then
        npm config set proxy "$HTTP_PROXY"
        npm config set https-proxy "$HTTP_PROXY"
    elif [[ -n "$HTTPS_PROXY" ]]; then
        npm config set proxy "$HTTPS_PROXY"
        npm config set https-proxy "$HTTPS_PROXY"
    fi

    npm install
}

# Run diagnostic checks
echo "Running diagnostic checks..."
if command_exists npm; then
    echo "npm is installed."
else
    echo "npm is not installed. Please install it to proceed."
    exit 1
fi

# Execute npm install
echo "Executing npm install..."
npm_install_with_proxy
