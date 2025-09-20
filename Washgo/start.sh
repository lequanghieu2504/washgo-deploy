#!/bin/bash

# Railway start script for WashGO Spring Boot Backend

echo "🚀 Starting WashGO Backend..."
echo "🔧 Java version:"
java -version

echo "📦 Building application with Maven..."
./mvnw clean package -DskipTests -q

echo "🏃 Starting Spring Boot application..."
java -XX:+UseContainerSupport \
     -XX:MaxRAMPercentage=75.0 \
     -XX:+UseG1GC \
     -Dserver.port=${PORT:-8080} \
     -Dspring.profiles.active=railway \
     -jar target/washgo-0.0.1-SNAPSHOT.jar