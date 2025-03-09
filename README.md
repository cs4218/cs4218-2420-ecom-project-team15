<h1>CS4218 AY 24/25 Semester 2 (Team 15)</h1>

CI Link: https://github.com/cs4218/cs4218-2420-ecom-project-team15/actions

<h2>Setup Instructions</h2>

1. Install packages

```
npm i
cd /client
npm i
```

2. Copy in the .env file under root. Ensure that your env file contains the following:

```
PORT =
DEV_MODE = development
MONGO_URL =
JWT_SECRET =
BRAINTREE_MERCHANT_ID =
BRAINTREE_PUBLIC_KEY =
BRAINTREE_PRIVATE_KEY =
```

3. You should be able to run the tests successfully now.

```
npm run test
npm run test:frontend
npm run test:backend
```

4. If you would like to run the application, but encounter an error, check that you are running **the latest version of Node**. If you are not, run the following commands:
```
node -v //should be v23.9.0
nvm install node
nvm use 23
```

5. If it still doesn't work, you may need to include the following line under the ```package.json``` file:
```
"name": "ecom",
"type": "module", //insert this line
...
```
_NOTE: Adding this in may cause the tests to fail due to ESM syntax. To execute the tests without issue, do not insert this configuration._
