# azure-func-demo
A repository for creating sample azure functions (serverless) using Typescript and VS Code

**Pre-requisites for Setting up Local Dev Environment**
--

The local dev env is easiest to setup if you're using VS Code, you will need to:
1. Install Azure Functions extension
2. Install Azure Functions Core Tools from [here](https://github.com/Azure/azure-functions-core-tools) 

To start the API server, run:
```bash
npm i
npm start 
```
By default the server with start listening on port 7071

**Environment Variables Required**
--

| Name        | Description                                                           |
|-------------|-----------------------------------------------------------------------|
| MONGODB_URI | The Mongoose connection string needed to connect to a MongoDB Cluster |

Please ensure the above environment variables are added, for running tests in your dev environment ideally a .env.test file should provide the environment, however for simplicity this demo uses VS Code Azure Functions template to get environment variables from .local.settings.json file

[Here](https://github.com/ZakiMalik/azure-func-demo/blob/master/.example.local.settings.json) is an example of .local.settings.json file, simple rename the file(remove ".example" from the name) and modify the Values to use it.

**API Exposed**
--

A postman collection is already included in the repository [here](https://github.com/ZakiMalik/azure-func-demo/blob/master/Azure%20Functions%20-%20Demo%20API.postman_collection.json)
You can import the postman collection, it already contains the different options available in the REST API along with saved examples containing request and responses

| Method | URL        | Purpose                                                                                             | Query Parameters                                                                     | Body                                              |
|--------|------------|-----------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------|---------------------------------------------------|
| GET    | /users     | fetch a paginated list of assigned or unassigned  users with the ability to filter by a search term | page (default: 1), size (default: 15), assigned (default: false), name (default: "") |                         -                         |
| PATCH  | /users/:id | edit a user's assigned status (to true or false)                                                    |                                           -                                          | assigned Boolean                                |
| PUT    | /users     | Bulk edit assigned status (to true or false) for one or more users                                  |                                           -                                          | userIds [MongooseObjectIds], assigned Boolean  |


**Tests:**
--

Unit/Functional Tests are Added. The tests currently use jest. The `dev-test` and `test` commands are added as scripts in package.json.

To run tests:
```bash
# start tests in watch mode
npm run dev-test 

# Get test results
npm run test
```

