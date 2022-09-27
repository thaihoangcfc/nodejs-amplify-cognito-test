// Cognito SDK
require('cross-fetch/polyfill');
var AmazonCognitoIdentity = require('amazon-cognito-identity-js');
var AWS = require('aws-sdk/global');

// Define Cognito pool data
var poolData = {
    UserPoolId: 'ap-southeast-2_Z2WZIv6Vz', // Your user pool id here
    ClientId: '75mp8s2mf46t5s7ht7f47kefqo', // Your client id here
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

    var dataFirstName = {
        Name: 'given_name',
        value: req.body.firstname
    };
    var dataLastName = {
        Name: 'family_name',
        value: req.body.lastname
    };

    var attributeFirstName = new AmazonCognitoIdentity.CognitoUserAttribute(dataFirstName);
    var attributeLastName = new AmazonCognitoIdentity.CognitoUserAttribute(dataLastName);

    attributeList.push(attributeFirstName);
    attributeList.push(attributeLastName);

    userPool.signUp(req.body.email, req.body.password, attributeList, null, function (
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

// Authenticate an user with Cognito
app.post('/login', urlencodedParser, function (req, res) {
    var userData = {
        Username: req.body.email,
        Pool: userPool
    }
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    var authenticationData = {
        Username: req.body.email,
        Password: req.body.password
    }

    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(
        authenticationData
    );

    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
            var accessToken = result.getAccessToken().getJwtToken();

            //POTENTIAL: Region needs to be set if not already set previously elsewhere.
            AWS.config.region = 'ap-southeast-2';

            AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                IdentityPoolId: 'ap-southeast-2:418a5abd-01a2-4118-8f06-693864fef817', // your identity pool id here
                Logins: {
                    // Change the key below according to the specific region your user pool is in.
                    'cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_Z2WZIv6Vz': result
                        .getIdToken()
                        .getJwtToken(),
                },
            });

            //refreshes credentials using AWS.CognitoIdentity.getCredentialsForIdentity()
            AWS.config.credentials.refresh(error => {
                if (error) {
                    console.error(error);
                } else {
                    // Instantiate aws sdk service objects now that the credentials have been updated.
                    // example: var s3 = new AWS.S3();
                    res.end('Access token: ' + accessToken);
                }
            });
        },

        onFailure: function (err) {
            res.end(err.message || JSON.stringify(err));
        },
    })
})

// Sample Hello World
app.get('/helloworld', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})