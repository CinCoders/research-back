# Starting the project

## Cloning the project

```bash
## Cloning the repository
git clone https://github.com/CinCoders/research-back.git

## Entering the directory
cd research-back
```

## Installing dependencies

Then install the project dependencies and some tools that will be used:

```bash
# Install the npm dependencies
$ npm install
```

## Creating and setting up the database

To run the postgres docker image and start a database:

```bash
# Run the docker image of postgres
$ docker run --name research-back -e POSTGRES_PASSWORD=docker -e POSTGRES_DB=research -e POSTGRES_USER=postgres -p 5432:5432 -d postgres
```

If you're not using Postgres, you can configure your docker for your own database.

Obs.: If you have already have a database image or driver on your PC, simply create a new database:

```sql
  CREATE DATABASE "research";
```

Setup your .env file according to your database connection options or simply by folloing the .example.env file.

Then you'll need to build the application to run the migrations:

```bash
# Build application
$ npm run build
```

To run the migrations:

```bash
# To run migration
$ npm run migration:run
```

It is worth mentioning that our application was tested and validated in PostgresSQL, make good use of it!

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```
