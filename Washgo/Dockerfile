FROM openjdk:17-jdk-slim

WORKDIR /app

# Copy Maven wrapper and pom.xml
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Make mvnw executable
RUN chmod +x ./mvnw

# Download dependencies
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN ./mvnw clean package -DskipTests

# Run the application
EXPOSE $PORT
CMD ["java", "-Dserver.port=$PORT", "-Dspring.profiles.active=render-debug", "-Djava.security.egd=file:/dev/./urandom", "-jar", "target/washgo-0.0.1-SNAPSHOT.jar"]