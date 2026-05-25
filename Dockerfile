# ── Stage 1: Build the Spring Boot jar ───────────────────────────────────────
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# Copy Maven wrapper and pom first so dependency downloads are cached
# (Docker only re-runs this layer if pom.xml changes)
COPY pom.xml mvnw ./
COPY .mvn .mvn
RUN ./mvnw dependency:go-offline -q

# Copy source and build
COPY src ./src
RUN ./mvnw package -DskipTests -q

# ── Stage 2: Run with a smaller JRE image ────────────────────────────────────
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Same memory limits as start.sh to avoid OOM kills
ENTRYPOINT ["java", "-Xms64m", "-Xmx256m", "-jar", "app.jar"]
