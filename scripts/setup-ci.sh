#!/bin/bash

LOG_FILE="setup-ci.log"
echo "=== Setup CI Script ===" > $LOG_FILE
echo "Date: $(date)" >> $LOG_FILE

# Function to log messages
log_message() {
    echo "$(date +'%Y-%m-%d %H:%M:%S') - $1" >> $LOG_FILE
}

# 1. Run npm doctor
log_message "Running npm doctor..."
npm doctor >> $LOG_FILE 2>&1
if [[ $? -ne 0 ]]; then
    log_message "npm doctor failed."
else
    log_message "npm doctor passed."
fi

# 2. Attempt npm install with proxy fallbacks
log_message "Attempting npm install..."
npm install >> $LOG_FILE 2>&1
if [[ $? -ne 0 ]]; then
    log_message "npm install failed, falling back to yarn."
    
    # 3. Fall back to yarn
    if command -v yarn >/dev/null 2>&1; then
        log_message "Attempting yarn install..."
        yarn install >> $LOG_FILE 2>&1
        if [[ $? -ne 0 ]]; then
            log_message "yarn install also failed, attempting Docker installation."
            
            # 4. Attempt Docker installation
            log_message "Attempting Docker installation..."
            # Assuming a basic installation command for demonstration
            # This may need to be replaced with the appropriate installation command for the system
            curl -fsSL https://get.docker.com -o get-docker.sh
            sh get-docker.sh >> $LOG_FILE 2>&1
            if [[ $? -ne 0 ]]; then
                log_message "Docker installation failed."
                echo "Please check the installation logs for issues." >> $LOG_FILE
            else
                log_message "Docker installation succeeded."
            fi
        else
            log_message "yarn install succeeded."
        fi
    else
        log_message "yarn not installed, skipping yarn install."
    fi
else
    log_message "npm install succeeded."
fi

# 5. Run git diff --check and git status
log_message "Running git diff --check..."
git diff --check >> $LOG_FILE 2>&1
log_message "Running git status..."
git status >> $LOG_FILE 2>&1

# 6. Finish up
log_message "Setup CI script completed."
echo "Log file can be found at $LOG_FILE." 
