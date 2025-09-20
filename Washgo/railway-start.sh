#!/bin/bash
# Build and run script for Railway

echo "Building with Maven..."
./mvnw clean package -DskipTests

echo "Starting application..."
java -jar target/washgo-0.0.1-SNAPSHOT.jar