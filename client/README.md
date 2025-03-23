# Running Tests

If you would like to run the integration tests created, please ensure you have a ```.env``` **created in this directory** with the following:
```
REACT_APP_API = http://localhost:6060
MONGO_URL = 
JWT_SECRET = 
DEV_MODE = test
```

To run them with the other tests created, please exit this directory and use the designated npm command.
```
cd ..
npm run test:frontend
```

Note that you will have to run ```npm run dev``` to execute select tests.
