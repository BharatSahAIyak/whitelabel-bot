#!/bin/bash

# Function to handle errors
handle_error() {
    echo "Error occurred: $1"
}

# Navigate to the specified folder
cd .next/static/chunks 2>/dev/null || {
    handle_error "Failed to change directory to .next/static/chunks. Make sure the directory exists."
    exit 0
}

# Execute commands and capture any errors
if [[ "$OSTYPE" == "darwin"* ]]; then
    grep_output=$(grep -rlE '12\.1\.6|17\.0\.2' . 2>&1) || handle_error "Grep failed: $grep_output"
    if [ -n "$grep_output" ]; then
        while IFS= read -r file; do
            sed_output=$(sed -i '' 's/12\.1\.6/xx.xx.xx/g; s/17\.0\.2/xx.xx.xx/g' "$file" 2>&1) || handle_error "Sed failed on $file: $sed_output"
        done <<< "$grep_output"
    else
        echo "No matching files found."
    fi
else
    grep_output=$(grep -rlE '12\.1\.6|17\.0\.2' . 2>&1) || handle_error "Grep failed: $grep_output"
    if [ -n "$grep_output" ]; then
        while IFS= read -r file; do
            sed_output=$(sed -i 's/12\.1\.6/xx.xx.xx/g; s/17\.0\.2/xx.xx.xx/g' "$file" 2>&1) || handle_error "Sed failed on $file: $sed_output"
        done <<< "$grep_output"
    else
        echo "No matching files found."
    fi
fi

# Always exit with success
exit 0