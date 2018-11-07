const ClientService = require('./ClientService');

//// SERVICE USE INFO ////

/* send_message

To send a message call send_message method with 2 parameters;
First parameter should be the message destination.
Second parameter should be the message body.

Examples below
*/



const client = new ClientService();
//client.send_message("dest", 42);
//client.send_message("dest", "");
//client.send_message("", "cosas");
//client.send_message("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "body");
//client.send_message("dest", undefined);
//client.send_message(undefined, "body");
//client.send_message("destination", "body");
client.get_message();