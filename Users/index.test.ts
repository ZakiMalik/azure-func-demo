import httpFunction from './index';
import context = require('azure-function-context-mock');
import { HttpRequest } from '@azure/functions';
const User = require('../models/User');
process.env.MONGODB_URI = require('./../local.settings.json').Values.MONGODB_URI;

describe('User List => GET /users[?page=&size=&name=&assigned=]', () => {
    
    test('should return a paginated list of Unassigned Users by default', async () => {

        const request: HttpRequest = {
            method: "GET" ,
            url: "",
            headers:{},
            query:{},
            params:{}  
        };

        await httpFunction(context, request);
        const res = context.res;

        expect(res).toBeDefined();
        expect(res).toHaveProperty('status');
        expect(res).toHaveProperty('body');
    
        expect(res.status).toEqual(200);

        expect(res.body).toHaveProperty('meta');
        expect(res.body).toHaveProperty('results');

        expect(res.body.meta).toBeDefined();
        expect(res.body.meta).toHaveProperty('page')
        expect(res.body.meta).toHaveProperty('size')
        expect(res.body.meta).toHaveProperty('total');
        
        expect(res.body.meta.page).toEqual(1);
        expect(res.body.meta.size).toEqual(15);
        
        expect(res.body.results[0]).toBeDefined();
        expect(res.body.results[0]).toHaveProperty('_id');
        expect(res.body.results[0]).toHaveProperty('name');
        expect(res.body.results[0]).toHaveProperty('picture');
        expect(res.body.results[0]).toHaveProperty('assigned');
        
        expect(res.body.results).toBeDefined();
        expect(res.body.results[0]._id).toBeDefined();
        expect(res.body.results[0].assigned).toBeFalsy();
        
        expect(res.body.results[0].name).toHaveProperty('title');
        expect(res.body.results[0].name).toHaveProperty('first');
        expect(res.body.results[0].name).toHaveProperty('last');

        expect(res.body.results[0].picture).toHaveProperty('large');
        expect(res.body.results[0].picture).toHaveProperty('medium');
        expect(res.body.results[0].picture).toHaveProperty('thumbnail');

    });

    test('should accept assigned as a query param and return a paginated list of assigned Users provided assigned is truthy', async () => {

        const request: HttpRequest = {
            method: "GET" ,
            url: "",
            headers:{},
            query:{
                assigned: "true"
            },
            params:{}  
        };

        await httpFunction(context, request);
        const res = context.res;

        expect(res).toBeDefined();
        expect(res).toHaveProperty('status');
        expect(res).toHaveProperty('body');
    
        expect(res.status).toEqual(200);

        expect(res.body).toHaveProperty('meta');
        expect(res.body).toHaveProperty('results');

        expect(res.body.meta).toBeDefined()
        expect(res.body.meta).toHaveProperty('page')
        expect(res.body.meta).toHaveProperty('size')
        expect(res.body.meta).toHaveProperty('total');
        
        expect(res.body.meta.page).toEqual(1);
        expect(res.body.meta.size).toEqual(15);
        
        expect(res.body.results).toBeDefined();
            
        expect(res.body.results[0]).toBeDefined();
        expect(res.body.results[0]).toHaveProperty('_id');
        expect(res.body.results[0]).toHaveProperty('name');
        expect(res.body.results[0]).toHaveProperty('picture');
        expect(res.body.results[0]).toHaveProperty('assigned');

        expect(res.body.results[0]._id).toBeDefined();

        expect(res.body.results[0].assigned).toBeTruthy();
        
        expect(res.body.results[0].name).toHaveProperty('title');
        expect(res.body.results[0].name).toHaveProperty('first');
        expect(res.body.results[0].name).toHaveProperty('last');

        expect(res.body.results[0].picture).toHaveProperty('large');
        expect(res.body.results[0].picture).toHaveProperty('medium');
        expect(res.body.results[0].picture).toHaveProperty('thumbnail');

    });

    test('should accept page, size as query param overrides return a paginated list overriding default values', async () => {

        const request: HttpRequest = {
            method: "GET" ,
            url: "",
            headers:{},
            query:{
                page: "2",
                size: "5"
            },
            params:{}  
        };

        await httpFunction(context, request);
        const res = context.res;

        expect(res).toBeDefined();
        expect(res).toHaveProperty('status');
        expect(res).toHaveProperty('body');
    
        expect(res.status).toEqual(200);

        expect(res.body).toHaveProperty('meta');
        expect(res.body).toHaveProperty('results');


        expect(res.body.meta).toBeDefined()
        expect(res.body.meta).toHaveProperty('page')
        expect(res.body.meta).toHaveProperty('size')
        expect(res.body.meta).toHaveProperty('total');
        
        expect(res.body.meta.page).toEqual(Number(request.query.page));
        expect(res.body.meta.size).toEqual(Number(request.query.size));
        
        expect(res.body.results).toBeDefined();
    });

    test('should accept assigned as a query param and return a paginated list of unassigned Users provided assigned is falsy', async () => {

        const request: HttpRequest = {
            method: "GET" ,
            url: "",
            headers:{},
            query:{
                assigned: "0"
            },
            params:{}  
        };

        await httpFunction(context, request);
        const res = context.res;

        expect(res).toBeDefined();
        expect(res).toHaveProperty('status');
        expect(res).toHaveProperty('body');
    
        expect(res.status).toEqual(200);

        expect(res.body).toHaveProperty('meta');
        expect(res.body).toHaveProperty('results');

        expect(res.body.meta).toBeDefined()
        expect(res.body.meta).toHaveProperty('page')
        expect(res.body.meta).toHaveProperty('size')
        expect(res.body.meta).toHaveProperty('total');
        
        expect(res.body.meta.page).toEqual(1);
        expect(res.body.meta.size).toEqual(15);
        
        expect(res.body.results).toBeDefined();
            
        expect(res.body.results[0]).toBeDefined();
        expect(res.body.results[0]).toHaveProperty('_id');
        expect(res.body.results[0]).toHaveProperty('name');
        expect(res.body.results[0]).toHaveProperty('picture');
        expect(res.body.results[0]).toHaveProperty('assigned');

        expect(res.body.results[0]._id).toBeDefined();

        expect(res.body.results[0].assigned).toBeFalsy();
        
        expect(res.body.results[0].name).toHaveProperty('title');
        expect(res.body.results[0].name).toHaveProperty('first');
        expect(res.body.results[0].name).toHaveProperty('last');

        expect(res.body.results[0].picture).toHaveProperty('large');
        expect(res.body.results[0].picture).toHaveProperty('medium');
        expect(res.body.results[0].picture).toHaveProperty('thumbnail');

    });

    test('should support search for assigned users', async () => {

        const request: HttpRequest = {
            method: "GET" ,
            url: "",
            headers:{},
            query:{
                name: "ana",
                assigned: "true"
            },
            params:{}  
        };

        await httpFunction(context, request);
        const res = context.res;

        expect(res).toBeDefined();
        expect(res).toHaveProperty('status');
        expect(res).toHaveProperty('body');
    
        expect(res.status).toEqual(200);

        expect(res.body).toHaveProperty('meta');
        expect(res.body).toHaveProperty('results');

        expect(res.body.meta).toBeDefined()
        expect(res.body.meta).toHaveProperty('page')
        expect(res.body.meta).toHaveProperty('size')
        expect(res.body.meta).toHaveProperty('total');
        
        expect(res.body.meta.page).toEqual(1);
        expect(res.body.meta.size).toEqual(15);
        
        expect(res.body.results).toBeDefined();
            
        expect(res.body.results[0]).toBeDefined();
        expect(res.body.results[0]).toHaveProperty('_id');
        expect(res.body.results[0]).toHaveProperty('name');
        expect(res.body.results[0]).toHaveProperty('picture');
        expect(res.body.results[0]).toHaveProperty('assigned');

        expect(res.body.results[0]._id).toBeDefined();

        expect(res.body.results[0].assigned).toBeTruthy();
        
        expect(res.body.results[0].name).toHaveProperty('title');
        expect(res.body.results[0].name).toHaveProperty('first');
        expect(res.body.results[0].name).toHaveProperty('last');
        
        const computedFullName = `${res.body.results[0].name.first} ${res.body.results[0].name.last}`;
        expect(computedFullName).toContain(request.query.name); 



        expect(res.body.results[0].picture).toHaveProperty('large');
        expect(res.body.results[0].picture).toHaveProperty('medium');
        expect(res.body.results[0].picture).toHaveProperty('thumbnail');
        
    });

    test('should support multi-lingual search and return unassigned Users by default', async () => {

        const request: HttpRequest = {
            method: "GET" ,
            url: "",
            headers:{},
            query:{
                name: "كاميا"
            },
            params:{}  
        };

        await httpFunction(context, request);
        const res = context.res;

        expect(res).toBeDefined();
        expect(res).toHaveProperty('status');
        expect(res).toHaveProperty('body');
    
        expect(res.status).toEqual(200);

        expect(res.body).toHaveProperty('meta');
        expect(res.body).toHaveProperty('results');

        expect(res.body.meta).toBeDefined()
        expect(res.body.meta).toHaveProperty('page')
        expect(res.body.meta).toHaveProperty('size')
        expect(res.body.meta).toHaveProperty('total');
        
        expect(res.body.meta.page).toEqual(1);
        expect(res.body.meta.size).toEqual(15);
        
        expect(res.body.results).toBeDefined();
            
        expect(res.body.results[0]).toBeDefined();
        expect(res.body.results[0]).toHaveProperty('_id');
        expect(res.body.results[0]).toHaveProperty('name');
        expect(res.body.results[0]).toHaveProperty('picture');
        expect(res.body.results[0]).toHaveProperty('assigned');

        expect(res.body.results[0]._id).toBeDefined();

        expect(res.body.results[0].assigned).toBeFalsy();

        const computedFullName = `${res.body.results[0].name.first} ${res.body.results[0].name.last}`;
        expect(computedFullName).toContain(request.query.name); 
        
        expect(res.body.results[0].name).toHaveProperty('title');
        expect(res.body.results[0].name).toHaveProperty('first');
        expect(res.body.results[0].name).toHaveProperty('last');

        expect(res.body.results[0].picture).toHaveProperty('large');
        expect(res.body.results[0].picture).toHaveProperty('medium');
        expect(res.body.results[0].picture).toHaveProperty('thumbnail');
        
    });

    test('should return sucess and empty array of results if page specified is greater than max page available', async () => {

        const request: HttpRequest = {
            method: "GET" ,
            url: "",
            headers:{},
            query:{
                page: "1000",
                size: "10"
            },
            params:{}  
        };

        await httpFunction(context, request);
        const res = context.res;

        expect(res).toBeDefined();
        expect(res).toHaveProperty('status');
        expect(res).toHaveProperty('body');
    
        expect(res.status).toEqual(200);

        expect(res.body).toHaveProperty('meta');
        expect(res.body).toHaveProperty('results');


        expect(res.body.meta).toBeDefined()
        expect(res.body.meta).toHaveProperty('page')
        expect(res.body.meta).toHaveProperty('size')
        expect(res.body.meta).toHaveProperty('total');
        
        expect(res.body.meta.page).toEqual(Number(request.query.page));
        expect(res.body.meta.size).toEqual(Number(request.query.size));
        
        expect(res.body.results).toBeDefined();
        expect(res.body.results.length).toEqual(0);
        
    });

});

describe('Edit a User => PATCH /users/:id', () => {
    
    test('should return an error 400 if required url parameter userId is not present', async () => {
        const request: HttpRequest = {
            method: "PATCH" ,
            url: "",
            headers:{},
            query:{},
            params:{},
            body:{}  
        };
    
        await httpFunction(context, request);
    
        const res = context.res;
        expect(res).toBeDefined();
        expect(res.status).toEqual(400);
        expect(res.body).toBeDefined();
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toContain(`Mandatory parameters missing`);
    });

    test('should return a 400 Bad Request if required url parameter userId is not ObjectId, provided the body contains editable field(s)', async () => {
        const request: HttpRequest = {
            method: "PATCH" ,
            url: "",
            headers:{},
            query:{},
            params:{
                id: "123"
            },
            body:{
                assigned : false
            }  
        };
    
        await httpFunction(context, request);
    
        const res = context.res;
        expect(res).toBeDefined();
        expect(res.status).toEqual(400);
        expect(res.body).toBeDefined();
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toContain('Mandatory parameters missing or in invalid format');
    });

    test('should return a 400 Bad Request if provided userId is valid but body does not contain editable field(s)', async () => {
        const unsavedUserId = new User()._id;

        const request: HttpRequest = {
            method: "PATCH" ,
            url: "",
            headers:{},
            query:{},
            params:{
                id: unsavedUserId
            },
            body:{
                someOtherField : false
            }  
        };
    
        await httpFunction(context, request);
    
        const res = context.res;
        expect(res).toBeDefined();
        expect(res.status).toEqual(400);
        expect(res.body).toBeDefined();
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toContain('No Editable Fields');
    });

    test('should return a 404 Not Found if provided userId is valid but user does not exist, provided the body contains editable field(s)', async () => {
        const unsavedUserId = new User()._id;

        const request: HttpRequest = {
            method: "PATCH" ,
            url: "",
            headers:{},
            query:{},
            params:{
                id: unsavedUserId._id
            },
            body:{
                assigned : false
            }  
        };
    
        await httpFunction(context, request);
    
        const res = context.res;
        expect(res).toBeDefined();
        expect(res.status).toEqual(404);
        expect(res.body).toBeDefined();
        expect(res.body).toHaveProperty('message');
    });

    test('should return a 200 OK Found if provided userId is valid, user does exist, provided the body contains editable field(s)', async () => {
        const unsavedUser = new User({
            name :{
                title: "mr",
                first: "Zaki",
                last: "Malik" 
            },
            picture: {
                large: "/path/to/large/pic",
                medium: "/path/to/medium/pic",
                thumbnail: "/path/to/thumbnail/pic"
            },
            assigned: false
        });
        let savedUser = await unsavedUser.save();
        let savedUserId = savedUser._id;



        const request: HttpRequest = {
            method: "PATCH" ,
            url: "",
            headers:{},
            query:{},
            params:{
                id: savedUserId
            },
            body:{
                assigned : true
            }  
        };
    
        await httpFunction(context, request);
    
        const res = context.res;
        expect(res).toBeDefined();
        expect(res.status).toEqual(200);
        expect(res.body).toBeDefined();
        expect(res.body).toHaveProperty('message');
        expect(res.body).toHaveProperty('user');
        expect(res.body.message).toContain('updated successfully');
        expect(res.body.user).toHaveProperty('assigned');
        expect(res.body.user.assigned).toBeTruthy();

        await unsavedUser.remove();
    });
    
    test('should return a non 200 Http Status if provided userId is valid, user does exist, provided the body contains editable field(s) but in invalid format', async () => {
        const unsavedUser = new User({
            name :{
                title: "mr",
                first: "Zaki",
                last: "Malik" 
            },
            picture: {
                large: "/path/to/large/pic",
                medium: "/path/to/medium/pic",
                thumbnail: "/path/to/thumbnail/pic"
            },
            assigned: false
        });
        let savedUser = await unsavedUser.save();
        let savedUserId = savedUser._id;



        const request: HttpRequest = {
            method: "PATCH" ,
            url: "",
            headers:{},
            query:{},
            params:{
                id: savedUserId
            },
            body:{
                assigned : 123
            }  
        };
    
        await httpFunction(context, request);
    
        const res = context.res;
        expect(res).toBeDefined();
        expect(res.status).not.toEqual(200);
        expect(res.body).toBeDefined();
        expect(res.body).toHaveProperty('message');

        await unsavedUser.remove();
    });
});

describe('Bulk Edit multiple Users => PUT /users', () => {
    
    test('should return a 400 Bad Request if required body parameters userIds are not present', async () => {
        const request: HttpRequest = {
            method: "PUT" ,
            url: "",
            headers:{},
            query:{},
            params:{},
            body:{}  
        };

        await httpFunction(context, request);

        const res = context.res;
        expect(res).toBeDefined();
        expect(res.status).toEqual(400);
        expect(res.body).toBeDefined();
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toContain('Please pass in valid userIds');
    });

    test('should return a non 200 Http Status if required url parameter userIds is not an array, provided body contains editable field(s)', async () => {
        const request: HttpRequest = {
            method: "PUT" ,
            url: "",
            headers:{},
            query:{},
            params:{},
            body:{
                userIds: "invalid string not an array",
                assigned: true
            }  
        };

        await httpFunction(context, request);

        const res = context.res;
        expect(res).toBeDefined();
        expect(res.status).toEqual(400);
        expect(res.body).toBeDefined();
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toContain('Please pass in valid userIds');
    });

    test('should return a 400 Bad Request if array of userIds provided are not valid ObjectIds', async () => {
        const request: HttpRequest = {
            method: "PUT" ,
            url: "",
            headers:{},
            query:{},
            params:{},
            body:{
                userIds: ["abc123", "def456"],
                assigned: true
            }  
        };

        await httpFunction(context, request);

        const res = context.res;
        expect(res).toBeDefined();
        expect(res.status).toEqual(400);
        expect(res.body).toBeDefined();
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toContain('Please pass in valid userIds');
    });

    test('should return a 400 Bad Request if provided userIds are valid but body does not contain editable field(s)', async () => {
        const unsavedUserIds = [new User()._id, new User()._id];

        const request: HttpRequest = {
            method: "PUT" ,
            url: "",
            headers:{},
            query:{},
            params:{},
            body:{
                userIds: unsavedUserIds,
                someOtherField : true
            }  
        };
    
        await httpFunction(context, request);
    
        const res = context.res;
        expect(res).toBeDefined();
        expect(res.status).toEqual(400);
        expect(res.body).toBeDefined();
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toContain('No Editable Fields');
    });

    test('should return a 404 Not Found if provided userIds are valid but no user matches, provided the body contains editable field(s)', async () => {
        const unsavedUserIds = [new User()._id, new User()._id];

        const request: HttpRequest = {
            method: "PUT" ,
            url: "",
            headers:{},
            query:{},
            params:{},
            body:{
                userIds: unsavedUserIds,
                assigned : true
            }  
        };
    
        await httpFunction(context, request);
    
        const res = context.res;
        expect(res).toBeDefined();
        expect(res.status).toEqual(404);
        expect(res.body).toBeDefined();
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toContain('No document(s) matched');
    });
 
    test('should return a 200 OK Found if provided userId(s) are valid, user(s) do exist, provided the body contains editable field(s)', async () => {
        const unsavedUser = new User({
            name :{
                title: "mr",
                first: "Zaki",
                last: "Malik" 
            },
            picture: {
                large: "/path/to/large/pic",
                medium: "/path/to/medium/pic",
                thumbnail: "/path/to/thumbnail/pic"
            },
            assigned: false
        });
        let savedUser = await unsavedUser.save();
        let savedUserId = savedUser._id;



        const request: HttpRequest = {
            method: "PUT" ,
            url: "",
            headers:{},
            query:{},
            params:{},
            body:{
                userIds: [savedUserId],
                assigned : true
            }  
        };
    
        await httpFunction(context, request);
    
        const res = context.res;
        expect(res).toBeDefined();
        expect(res.status).toEqual(200);
        expect(res.body).toBeDefined();
        expect(res.body).toHaveProperty('message');

        expect(res.body).toHaveProperty('details');
        expect(res.body.details).toHaveProperty('receivedIdsLength');
        expect(res.body.details).toHaveProperty('success');
        expect(res.body.details).toHaveProperty('usersMatchedLength');
        expect(res.body.details).toHaveProperty('usersUpdatedLength');
        expect(res.body.details).toHaveProperty('validFilteredIdsLength');

        expect(res.body.details.success).toBeTruthy();
        expect(res.body.details.usersMatchedLength).toBeGreaterThanOrEqual(1);



        await unsavedUser.remove();
    });
    
    test('should return a non 200 Http Status if provided userId(s) are valid, user(s) do not exist, provided the body contains editable field(s) but in invalid format', async () => {
        const unsavedUser = new User({
            name :{
                title: "mr",
                first: "Zaki",
                last: "Malik" 
            },
            picture: {
                large: "/path/to/large/pic",
                medium: "/path/to/medium/pic",
                thumbnail: "/path/to/thumbnail/pic"
            },
            assigned: false
        });
        let savedUser = await unsavedUser.save();
        let savedUserId = savedUser._id;



        const request: HttpRequest = {
            method: "PUT" ,
            url: "",
            headers:{},
            query:{},
            params:{},
            body:{
                userIds : [savedUserId],
                assigned : 123
            }  
        };
    
        await httpFunction(context, request);
    
        const res = context.res;
        expect(res).toBeDefined();
        expect(res.status).not.toEqual(200);
        expect(res.body).toBeDefined();
        expect(res.body).toHaveProperty('message');

        await unsavedUser.remove();
    });
 
});

describe('Not Applicable Http Methods => POST /users', () => {
    
    test('Methods other than GET, PATCH, PUT on /users should return an error', async () => {
        const request: HttpRequest = {
            method: "POST" ,
            url: "",
            headers:{},
            query:{},
            params:{}  
        };

        await httpFunction(context, request);

        const res = context.res;
        expect(res).toBeDefined();
        expect(res.status).toEqual(404);
        expect(res.body).toBeDefined();
        expect(res.body).toHaveProperty('message');
    });
});