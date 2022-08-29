// Cognito SDK
require('cross-fetch/polyfill');
var AmazonCognitoIdentity = require('amazon-cognito-identity-js');

// Define Cognito pool data
var poolData = {
    UserPoolId: 'ap-southeast-2_wwj1UXxlK', // Your user pool id here
    ClientId: '5djt99e1juump7dvlch99uf301', // Your client id here
};

var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

// Basic Express server
const express = require('express')
const app = express()
const port = 3000
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false })

// Register an user with Cognito
app.post('/register', urlencodedParser, function (req, res) {
       
    var attributeList = [];

    var dataEmail = {
        Name: 'email',
        Value: req.body.email,
    };

    var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);

    attributeList.push(attributeEmail);

    userPool.signUp(req.body.username, req.body.password, attributeList, null, function (
        err,
        result
    ) {
        var response = null;
        if (err) {
            response = {
                error: err
            }
        }
        else {
            var cognitoUser = result.user;
            response = {
                username: cognitoUser.getUsername()
            }
        }
        res.end(JSON.stringify(response));
    });
})



// Sample Hello World
app.get('/helloworld', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})