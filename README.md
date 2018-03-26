# React Blog API server

## Introduction

Api server of React Blog project

## Requirements

- [Yarn](https://yarnpkg.com/) package + [Node.js](https://nodejs.org/) v8.9 or
  newer
- MongoDB 3.6.1 or
  newer

## Setup

### 1. Installing dependencies

``` bash
yarn global add nodemon
yarn install
```

### 2. Setting environment variables

Rename the file `.env.example` to `.env`. Open the edited file and change values here to fit your development environment.

### 3. Import test data to database

```
cd data/
sh import.sh
```

### 4. Run the app

``` bash
yarn start
```

## Directory Layout

```
.
├── /.vscode/                   # contain workspace visual studio code setting
├── /data/                      # contains sample data and import/export scripts
├── /logs/                      # contains application's log files
├── /modules/                   # list of application's modules
│   ├── /common/                # reusable code for all projects
│   └── /app/                   # code specific for this project
│       ├── /admin/             # code related to admin's feature
│       ├── /models/            # contain mongoose model code files
│       ├── /email/             # contain list of email template files for current module
│       ├── router.js           # expressjs router object
│       ├── handlers.js         # a collection of express middleware functions
│       ├── helpers.js          # custom javascript functions
│       └── ...                 # any files specific to the technology we use
├── /node_modules/              # 3rd-party libraries and utilities
├── /test/                      # contain automation test scripts
├── .env.example                # environment template file
├── .eslintrc.json              # eslint config file
├── .gitignore                  # gitignore file
├── app.js                      # express application object
├── config.js                   # application's configuration object
├── index.js                    # entry point of the project
├── README.md                   # contains installation instruction
├── package.json                # contains 3rd party libraries and utilities
```

## Run Test

All test are written in `/test` directory. To run the test, use this command:

```
yarn run test
```

## How should i write code?

Please refer to [Code Standard](https://the-app-team.atlassian.net/wiki/spaces/CI/pages/33521966/Code+Standards) documentation here.