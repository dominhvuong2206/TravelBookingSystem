FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean verify

FROM tomcat:10.1-jdk17-temurin
COPY --from=build /app/target/travel-booking-backend-1.0-SNAPSHOT.war /usr/local/tomcat/webapps/TravelBookingSystem.war
EXPOSE 8080
CMD ["catalina.sh", "run"]
