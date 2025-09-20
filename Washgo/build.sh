#!/bin/bash
echo "🚀 Starting Render build process..."

# Make mvnw executable
chmod +x ./mvnw

# Clean and build the application
echo "📦 Building application with Maven..."
./mvnw clean package -DskipTests -q

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "📁 JAR file created: $(ls -la target/*.jar)"
else
    echo "❌ Build failed!"
    exit 1
fi