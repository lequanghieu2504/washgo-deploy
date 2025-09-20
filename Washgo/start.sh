#!/bin/bash

# Build the application
echo "Building Spring Boot application..."
./mvnw clean package -DskipTests

# Start the application
echo "Starting Spring Boot application..."
java -XX:+UseContainerSupport \
     -XX:MaxRAMPercentage=75.0 \
     -XX:+UseG1GC \
     -Dserver.port=${PORT:-8080} \
     -Dspring.profiles.active=railway \
     -jar target/washgo-0.0.1-SNAPSHOT.jar