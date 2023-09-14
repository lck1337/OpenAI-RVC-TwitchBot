const WebSocket = require('ws');
const crypto = require('crypto');

module.exports = class rvcClient {
    constructor() {
        this.hash = crypto.randomBytes(4).toString('hex');
        this.ws = null;
        this.response = null;
    }
    
   async init() {
    return new Promise((res) => {
    this.ws = new WebSocket('ws://127.0.0.1:7897/queue/join');    
    this.ws.on('error', console.error);


    this.ws.on('message', (data) => { 
    const jsonData = JSON.parse(data);
    console.log(jsonData);
    if(jsonData.msg == "send_hash") this.ws.send(`{"session_hash":"${this.hash}","fn_index":5}`);
    if(jsonData.msg == "send_data") this.ws.send(`{"fn_index":5,"data":["pudges.pth",0.33,0.33],"session_hash":"${this.hash}"}`);
    });

    this.ws.on('close', () => {
        res(true);
        });
    });
   }

   async convert(path) {
    return new Promise((res) => {
    this.ws = new WebSocket('ws://127.0.0.1:7897/queue/join');    
    this.ws.on('error', console.error);


    this.ws.on('message', (data) => { 
    const jsonData = JSON.parse(data);
    console.log(jsonData);
    if(jsonData.msg == "send_hash") this.ws.send(`{"session_hash":"${this.hash}","fn_index":2}`);
    if(jsonData.msg == "send_data") this.ws.send(`{"fn_index":2,"data":[0,"${path}",-8,null,"pm","","",0.88,3,0,1,0.33],"session_hash":"${this.hash}"}`);
    if(jsonData.msg == "process_completed") this.response = jsonData.output.data[1].name;
    });

    this.ws.on('close', () => {
        res(this.response);
        });
    });
   }
}
