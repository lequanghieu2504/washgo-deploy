# Backend Dockerfile optimized for Railway
FROM maven:3.9.9-eclipse-temurin-17 AS builder

WORKDIR /app

# Copy pom.xml first for better layer caching
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Copy source code
COPY src ./src

# Build .jar with Maven
RUN mvn -f pom.xml clean package -DskipTests -q

# Stage 2: Runtime
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy .jar from build stage
COPY --from=builder /app/target/washgo-0.0.1-SNAPSHOT.jar app.jar

# Create uploads directory
RUN mkdir -p /app/uploads

# Use PORT environment variable from Railway
EXPOSE $PORT

# Optimized JVM settings for Railway
ENTRYPOINT ["sh", "-c", "java -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+UseG1GC -Dserver.port=${PORT:-8080} -jar app.jar"]