# Dockerfile

# Use a base image
FROM ubuntu:latest

# Set environment variables to bypass proxy settings
ENV http_proxy=""
ENV https_proxy=""

# Install necessary packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    ... # Add your required packages here

# Set working directory
WORKDIR /app

# Copy your application files
COPY . .

# Command to run your app
CMD ["your_application_command"] 
