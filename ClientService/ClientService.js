const axios = require('axios');

class ClientService {
    constructor(){
        this.service = axios.create({
            baseURL: 'http://localhost:9001',
            withCredentials: true
          });
    }

    send_message (destination, body) {
        return this.service.post('/message', {destination, body})
        .then(response => console.log("RESPONSE", response.data.data))
        .catch (e => console.log("ERROR", e.response.data.status))
    }

    get_message() {
        return this.service.get('/message')
        .then(response => console.log("RESPONSE", response.data.data))
        .catch(e => console.log("ERROR", e.response.data.status))
    }

    add_credit(amount) {
        return this.service.post('/credit', {amount})
        .then(response => console.log("RESPONSE", response.data.data))
        .catch(e => console.log("ERROR", e.response.data.status))
    }
}

module.exports = ClientService;