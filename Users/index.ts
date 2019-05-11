import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import * as mongoose from 'mongoose';
import * as _ from 'lodash';
const User = require('../models/User');

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
        case "PUT":
            await updateUsersInBulk(context, req);
            break;
        // This will return a 404 for all methods other than get and patch that have been allowed in function.json file under bindings[0].methods
        default:
            sendErrorResponse(404, new Error(`The route method is not applicable for this resource`), context);
    }
};

/**
 * This function supports:
 * 1. filtering users collection, by default it filters unassigned users. To filter assigned users the query param assigned needs to be set to true or any numeric value > 0.
 * 2. searching users collection. The "name" query parameter needs to be passed with the value as the search term
 * 3. results are paginated. By default pageNumber is 1, pageSize is 15. These defaults can be overridden by passing in query params page and size respectively
 * 
 * Note: Results contain a meta object detailing the page, size and total results
 * 
 * @param context 
 * @param req 
 */
const getAllUsers = async function (context: Context, req: HttpRequest): Promise<void> {
    try{
        context.log(`inside getAllUsers fn`);
        const {size=null, page=null, name=null, assigned=false} = req.query;
        let pageSize = (size && parseInt(size)) ? parseInt(size) : 15, 
            pageNum = (page && parseInt(page)) ? parseInt(page) : 1,
            skipVal = pageSize * (pageNum - 1);
        let isAssigned = (assigned && ( Number(assigned) > 0 || assigned.toLowerCase().trim() === "true")) ? true : false;    
        context.log(`pageSize: ${pageSize}, pageNum: ${pageNum}, skipVal: ${skipVal}, isAssigned: ${isAssigned}`);

        // By default query object will filter all users that have not been assigned yet
        let queryObj = {
            assigned: false
        };

        // By default there is no sorting -- will only be used for searches and to rank text scores
        let sortObj = {};
        
        /**
         * name will be defined in case of search -- add search criteria to queryObj, sortObj (to sort on text score)
         * solution for acheiving partial auto-complete functionality with relevance
         * 1. do text search -- text index is already defined on name.first and name.last this will help in improving relevance as searchTerm size increases
         * 2. do a regex search -- regexes based on start anchors will help provide results for partial filtering 
         * */
        if(name){
            let nameRegex = new RegExp(`^${name}`, "i");    
            context.log(`nameRegex: ${nameRegex}`);

            queryObj["$or"] = [
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
            ];
            
            sortObj = { score: { $meta: "textScore" } };
        }

        // this flag will be set when filtering / searching for assigned users -- add search criteria to queryObj
        if(isAssigned){
            queryObj.assigned = true;
        }
        context.log(`queryObj: ${JSON.stringify(queryObj)}`);
        const promiseArr = [User.countDocuments(queryObj), User.find(queryObj, sortObj).sort(sortObj).skip(skipVal).limit(pageSize)];
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
 * 
 * @param context 
 * @param req : req.params.id and req.body.assigned properties are required otherwise validation errors will be received
 * 
 * Updates a user's assigned flag to true/false , provided the a valid mongoose userId is provided
 */
const updateUserById = async function (context: Context, req: HttpRequest): Promise<void> {
    try{
        context.log(`inside updateUserById fn`);
        const userId = (req.params && req.params.id) ? req.params.id :  null;
        // NOTE: Do not add the _id field in allowedFields array
        const allowedFields = ["assigned"];
        if (userId && req.body && mongoose.Types.ObjectId.isValid(userId)) {
            let objToSet = {};
            for( let key in req.body){
                if(allowedFields.includes(key)){
                    objToSet[key] = req.body[key];
                }
            }
            if(Object.keys(objToSet).length){
                let updatedUser = await User.findByIdAndUpdate(userId, {$set: objToSet}, {new: true});
                if(updatedUser) {
                  sendResponse(200, {
                    message: `user has been updated successfully`,
                    user: updatedUser
                  }, context);
                } else {
                  sendResponse(404,{
                      message: `The specified user does not exist`
                  }, context);
                }        
            }else{
                context.log(`body doesn't contain modifiable fields, nothing to update`);
                sendResponse(400, {
                    message : `No Editable Fields Specified in Request`
                }, context);
            }
        }
        else {
            context.log(`req.params is missing userId`);
            sendResponse(400, {
                message : `Mandatory parameters missing or in invalid format`
            }, context);
        }
    }catch(e){ 
        sendErrorResponse(500, e, context);
    }
};

/**
 * This function does a bulk update operation for given valid mongoose userIds, for purposes of this demo update
 * only works on the assigned field setting/unsetting its Boolean value  
 * @param context 
 * @param req : req.body.userIds and req.body.assigned are mandatory params
 */
const updateUsersInBulk = async function (context: Context, req: HttpRequest): Promise<void> {
    try{
        context.log(`inside updateUsersInBulk fn`);
        const userIds = (req.body && req.body.userIds && Array.isArray(req.body.userIds)) ? req.body.userIds :  [];
        const validFilteredIds = userIds.filter((userId) => mongoose.Types.ObjectId.isValid(userId));
        let meta = {
            success: false,
            receivedIdsLength: userIds.length,
            validFilteredIdsLength: validFilteredIds.length,
            usersUpdatedLength: 0,
            usersMatchedLength: 0,
        };

        //Only allowed field to update currently is the assigned key
        // NOTE: Do not add the _id and userIds field in allowedFields array
        const allowedFields = ["assigned"];

        if (validFilteredIds.length) {
            let objToSet = {};
                for( let key in req.body){
                    if(allowedFields.includes(key)){
                        objToSet[key] = req.body[key];
                    }
                }
                if(Object.keys(objToSet).length){
                    let updatedUsersMeta = await User.update({_id: validFilteredIds}, {$set: objToSet}, {new: true, multi: true});
                    console.log(`updatedUsersMeta: ${JSON.stringify(updatedUsersMeta)}`);
                    if(updatedUsersMeta) {
                        const {ok:success=false, nModified:docsModifiedCount=0, n:docsMatched=0} = updatedUsersMeta;
                        meta.success = (success) ? true : false;
                        meta.usersMatchedLength = docsMatched;
                        meta.usersUpdatedLength = docsModifiedCount;

                        if(!docsMatched){
                            sendResponse(404, {
                                details: meta,
                                message: `No document(s) matched the UserIds provided`
                            }, context);
                        }else{
                            sendResponse(200, {
                                details: meta,
                                message: `Operation ${meta.success ? "successful" : "unsuccessful"},  ${meta.usersMatchedLength} User document(s) matched, ${meta.usersUpdatedLength} document(s) updated`
                            }, context);
                        }

                    } else {
                        sendResponse(404,{
                            message: `The specified user(s) do not exist and were not updated`
                        }, context);
                    }        
                }else{
                    context.log(`body doesn't contain modifiable fields, nothing to update`);
                    sendResponse(400, {
                        message : `No Editable Fields Specified in Request`
                    }, context);
                }
        }else {
            sendResponse(400, {
                message : `Please pass in valid userIds`
            }, context);
        }
    }catch(e){ 
        sendErrorResponse(500, e, context);
    }
};

/**
 * Utility function to send route response in JSON
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
    // context.log(`returning response from route invocation: ${JSON.stringify(response)}`);
    context.res = response;
};

/**
 * Utility function to log error and send error response from the route invocation
 * @uses sendResponse fn
 * @param status 
 * @param errorObj 
 * @param context 
 */
const sendErrorResponse = async function (status: number, errorObj: Error, context: Context): Promise<void> {
    context.log(`exception occured: ${errorObj.message}`);
    status = (status) ? status : 500;
    sendResponse(status, {
        message : (errorObj.message) ? errorObj.message : ""
    }, context);
};

export default httpTrigger;
