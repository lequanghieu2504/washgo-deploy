# Stage 1: Build app with Maven - optimized for caching
FROM maven:3.9.9-eclipse-temurin-17 AS builder

WORKDIR /app

# Copy pom.xml first and download dependencies (for better layer caching)
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy source code
COPY src ./src

# Build .jar with Maven
RUN mvn -f pom.xml clean package -DskipTests

# Stage 2: Runtime with optimized JVM settings
FROM eclipse-temurin:17-jre-alpine

# Add non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

WORKDIR /app

# Copy .jar from build stage
COPY --from=builder /app/target/washgo-0.0.1-SNAPSHOT.jar app.jar

# Change ownership to non-root user
RUN chown -R appuser:appgroup /app

# Create uploads directory
RUN mkdir -p /app/uploads && chown -R appuser:appgroup /app/uploads

# Switch to non-root user
USER appuser

# Expose port 8080
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Optimized JVM settings for containerized environment
ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-XX:+UseG1GC", \
    "-XX:+UseStringDeduplication", \
    "-XX:+OptimizeStringConcat", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-jar", "app.jar"]
