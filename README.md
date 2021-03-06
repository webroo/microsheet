# Microsheet

A very small spreadsheet. Built with React, Redux, and Immutable.

![Screenshot](./screenshot.png)

Features:

- Formula support, inc. cell references
- Basic formula calculations (SUM and AVERAGE)
- Autofill
- Full keyboard support

## Install

Clone repository, then run:

    npm install

## Run scripts

Run scripts are handled by npm using the `scripts` field in `package.json`.

`npm run serve` - Serves a development version of the app at `http://localhost:8080`

`npm run serve-tests` - Serves a test runner at `http://localhost:8081`

`npm run serve-prod` - Serves a production version at `http://localhost:8080`

`npm run build-dev` - Builds a dev version of the app and writes the files to the `build` folder

`npm run build-prod` - Builds a production version of the app and writes the files to the `build` folder

`npm run build-tests` - Builds the test suite and writes the files to the `build` folder
