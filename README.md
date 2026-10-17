# cse3310-library-system

initial backend commit - steps to set up the backend for your machine:
1. install java 21 if you haven't already with this command on windows powershell:
    - winget install EclipseAdoptium.Temurin.21.JDK
2. restart the terminal and check if the install worked with these commands:
    - java -version
    - javac -version
3. install postgresql if you haven't already
    1. go to https://www.postgresql.org/download/, choose the appropriate installer
        for your operating system and run the installer
    2. during installation: keep the default port to 5432 and set the password
        for the postgres user, you will need to remember this password to connect to
        the database
    3. once postgresql is installed, open the VS Code terminal and run these commands:
        - psql -h localhost -p 5432 -U postgres -d postgres
            - enter the password you created during installation 
        - CREATE DATABASE cse3310_librarydb
        - \l (this command checks to see if the database was created)
        - \q (exit out of psql)
4. open: library-backend/src/main/resources/application.properties
5. make sure these properties are present:
    - spring.datasource.url=jdbc:postgresql://localhost:5432/cse3310_librarydb
    - spring.datasource.username=postgres
    - spring.datasource.password=${DB_PASSWORD}
    - spring.jpa.hibernate.ddl-auto=update
6. set the password environment variable to the password you created during postgresql installation
    - $env:DB_PASSWORD="yourpassword"
        - you will have to do this command every time you start a new terminal session
7. change into the library-backend folder
    - cd library-backend
8. run the backend (on windows powershell):
    - ./mvnw.cmd spring-boot:run
9. if it says "Started LibraryBackendApplication" then everything is working

## Frontend Setup
### Prerequisites
- Node.js (https://nodejs.org/en/download)

### Setup
1. `cd frontend`
2. `npm install`
3. create a `.env` file in the `frontend` folder using `.env.example` as the template.
4. `npm run dev`