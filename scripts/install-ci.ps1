# PowerShell script to handle npm install with proxy fallbacks for Windows environments

# Set your proxy settings here.
$proxyUrl = "http://your-proxy-url:port"
$noProxy = "localhost,127.0.0.1"

# Function to set npm proxy settings
function Set-NpmProxy {
    npm config set proxy $proxyUrl
    npm config set https-proxy $proxyUrl
    npm config set no-proxy $noProxy
}

# Function to install npm packages
function Install-NpmPackages {
    try {
        # Attempt to install npm packages
        npm install
    } catch {
        Write-Host "npm install failed, trying to set proxy..."
        Set-NpmProxy
        # Retry npm install
        npm install
    }
}

# Execute the install function
Install-NpmPackages