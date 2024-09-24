import { WebSocketServer,WebSocket } from "ws";
const wss=new WebSocketServer({port:8080});
let senderSocket: null | WebSocket = null;//global variables
let receiverSocket: null | WebSocket = null;//global variables
wss.on('connection',function connection(ws:WebSocket){
    ws.on('error',console.error);
    ws.on('message',function message(data: any){
        const message =JSON.parse(data);
        if(message.type === "sender"){
                senderSocket = ws; // No type error here
            
        }
        else  if(message.type === "receiver"){
           receiverSocket = ws;
        }
        else if(message.type==="create-offer"){
            receiverSocket?.send(JSON.stringify({type:"createOffer",sdp:message.sdp}));
        }
        else if(message.type==="create-answer"){
            senderSocket?.send(JSON.stringify({type:"createAnswer",sdp:message.sdp}));
        }
        else if (message.type === 'iceCandidate') {
            if (ws === senderSocket) {
              receiverSocket?.send(JSON.stringify({ type: 'iceCandidate', candidate: message.candidate }));
            } else if (ws === receiverSocket) {
              senderSocket?.send(JSON.stringify({ type: 'iceCandidate', candidate: message.candidate }));
            }
          }
    });
    ws.send('something');
    //identity as sender//sendersocket
    //identify as receiver//receiver socket

    //need to support createoffer
    //create answer
    //add ice candidates

});
//simple websocket server
