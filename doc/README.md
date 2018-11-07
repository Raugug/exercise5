# API DOCUMENTATION

# API CONTRACT

API ENDPOINT
http://BASE_URL:PORT/messsage

Send messages using client service or directly sending a POST request to the endpoint

ENDPOINT JSON FORMAT

{
  "destination": "STRING",
  "body": "STRING"
}

"destination" and "body" fields MUST be provided and they MUST be strings.
Be sure you send your request using the correct JSON format. In case you provide an incorrect format, the API will send you a JSON format error.

ClientService:

To send a message call send_message method with 2 parameters;
First parameter should be the message destination.
Second parameter should be the message body.

const ClientService = require('./ClientService');
const client = new ClientService();
send_message (destination, body);




API SUCCESS RESPONSE:

status 200
response OK


API FAILURE RESPONSES:

Undefined fields:

    status 400
    "Message body/destination can't be undefined"

Fields not provided:

    status 400
    "body or destination not provided"

Fields are not strings:

    status 400
    "body and destination must be strings"

Empty fields:

    status 400
    "all fields must be filled"

Body size > 200 characters

    status 400
    "body length excedeed"

Destination size > 100 characters

    status 400
    "destination length excedeed"

External message service failure:

    status 500
    "500 SERVER ERROR: EXTERNAL SERVICE DIDN'T RESPONSE"


Request limit set to 500 requests per hour.

    status 429
    message: "Too many requests from this IP, please try again after an hour"

