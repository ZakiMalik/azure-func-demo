import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import * as mongoose from 'mongoose';
import * as _ from 'lodash';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    
    const MONGODB_URI = process.env.MONGODB_URI; 

    mongoose.Promise = global.Promise;
    mongoose.connect(MONGODB_URI, {useNewUrlParser: true});

    mongoose.connection.on('error', (err) => {
        context.log(`ERROR→ ${err.message}`);
    });

    switch(req.method){
        // This will handle GET /api/users and can be extended to also handle /api/users/{userId}
        case "GET":
            await getAllUsers(context, req);
            break;
        // This will handle PATCH /api/users/{userId}, where userId will be mandatory param enforced through code
        case "PATCH":
            await updateUserById(context, req);
            break;
        // This will return a 404 for all methods other than get and patch that have been allowed in function.json file under bindings[0].methods
        default:
            sendErrorResponse(404, new Error(`The route method is not applicable for this resource`), context);
    }
};

/**
 * 
 * @param context 
 * @param req 
 */
const getAllUsers = async function (context: Context, req: HttpRequest): Promise<void> {
    try{
        context.log(`inside getAllUsers fn`);
        const User = require('./../models/User.js');
        const {size=null, page=null, name=null, assigned=false} = req.query;
        let pageSize = (size && parseInt(size)) ? parseInt(size) : 15, 
            pageNum = (page && parseInt(page)) ? parseInt(page) : 1,
            skipVal = pageSize * (pageNum - 1);
        let isAssigned = (assigned && ( Number(assigned) > 0 || assigned.toLowerCase().trim() === "true")) ? true : false;    
        context.log(`pageSize: ${pageSize}, pageNum: ${pageNum}, skipVal: ${skipVal}, isAssigned: ${isAssigned}`);

        let queryObj = {};
        if(name){
            let nameRegex = new RegExp(`^${name}`, "i");
                
            context.log(`nameRegex: ${nameRegex}`);
            queryObj = { 
                $or:[
                    {
                        $text: {
                            $search: name
                        } 
                    }, 
                    {
                        "name.first":{
                            $regex: nameRegex,
                            $options: "i"
                        }
                    },
                    {
                        "name.last":{
                            $regex: nameRegex,
                            $options: "i"
                        }
                    }
                ]
                
            };
        }

        if(isAssigned){
            queryObj["assigned"] = true;
        }
        context.log(`queryObj: ${JSON.stringify(queryObj)}`);
        const promiseArr = [User.countDocuments(queryObj), User.find(queryObj).skip(skipVal).limit(pageSize)];
        const resultArr =  await Promise.all(promiseArr);
        const [total, results] = resultArr;
        const meta = {
            page: pageNum,
            size: pageSize,
            total
        };    

        sendResponse(200, {
            meta,
            results
        }, context);
    }catch(e){ 
        sendErrorResponse(500, e, context);
    }
};

/**
 * For this function will only be demo-ing updating the assigned flag's value
 * @param context 
 * @param req 
 */
const updateUserById = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log(`inside updateUserById fn`);
    const userId = (req.params && req.params.id) ? req.params.id :  null;
    
    if (userId) {
        sendResponse(200, {
            message : `received userId: ${userId}`
        }, context);
    }
    else {
        sendResponse(400, {
            message : `Please pass a userId, it is a mandatory parameter`
        }, context);
    }
};

/**
 * 
 * @param status 
 * @param body 
 * @param context 
 */
const sendResponse = async function (status: number, body: object, context: Context): Promise<void> {
    let response = {
        status,
        body,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    context.log(`returning response from route invocation: ${JSON.stringify(response)}`);
    context.res = response;
};

const sendErrorResponse = async function (status: number, errorObj: Error, context: Context): Promise<void> {
    context.log(`exception occured: ${errorObj.message}`);
    status = (status) ? status : 500;
    sendResponse(status, {
        message : (errorObj.message) ? errorObj.message : ""
    }, context);
};

export default httpTrigger;
