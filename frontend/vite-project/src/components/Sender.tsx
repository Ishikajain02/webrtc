{/*import { useEffect, useState } from 'react'

const Sender = () => {
  const [socket,setSocket]=useState<WebSocket | null>(null);
  useEffect(()=>{
    const socket = new WebSocket('ws://localhost:8080');
    socket.onopen=()=>{
      socket.send(JSON.stringify({type:'sender'}));
    }
    setSocket(socket);
  },[]);
  async function startSendingVideo(){
    if(!socket)return;
    const pc = new RTCPeerConnection();
    pc.onnegotiationneeded=async()=>{
    const offer=await pc.createOffer();//sdp
    await pc.setLocalDescription(offer);
    socket?.send(JSON.stringify({type:'createOffer',sdp:pc.localDescription}));
    }
    pc.onicecandidate=(event)=>{
      if(event.candidate){
        socket?.send(JSON.stringify({type:'iceCandidate',candidate:event.candidate}));
      }
    }
   
    //what is the need for setting description ?????????????

    socket.onmessage=(event)=>{
      const data=JSON.parse(event.data);
      if(data.type==='createAnswer'){
        pc.setRemoteDescription(data.sdp);
      }
      else if(data.type=='iceCandidate'){
        pc.addIceCandidate(data.candidate);//trickling ice candiadtes
      }
    }
    const stream=await navigator.mediaDevices.getUserMedia({video:true,audio:false});
   pc.addTrack(stream.getVideoTracks()[0]);
  
  } 
  
  return (
    <div>Sender
      <button onClick={startSendingVideo}>Send video</button>
    </div>
  )
}

export default Sender*/}
import { useEffect, useState } from "react";

export const Sender = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [pc, setPC] = useState<RTCPeerConnection | null>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    setSocket(socket);

    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          type: "sender",
        })
      );
    };

    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "createAnswer" && pc) {
        await pc.setRemoteDescription(message.sdp);
      } else if (message.type === "iceCandidate" && pc) {
        await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
      }
    };

    return () => {
      socket.close();
    };
  }, [pc]); // Add pc as a dependency to access the updated value

  const initiateConn = async () => {
    if (!socket) {
      alert("Socket not found");
      return;
    }

    const peerConnection = new RTCPeerConnection(); // Initialize pc here
    setPC(peerConnection); // Store pc in state

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.send(
          JSON.stringify({
            type: "iceCandidate",
            candidate: event.candidate,
          })
        );
      }
    };

    peerConnection.onnegotiationneeded = async () => {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      socket.send(
        JSON.stringify({
          type: "createOffer",
          sdp: peerConnection.localDescription,
        })
      );
    };

    getCameraStreamAndSend(peerConnection);
  };

  const getCameraStreamAndSend = (peerConnection: RTCPeerConnection) => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();
      document.body.appendChild(video); // This would normally be handled by React, but we'll append it directly for now.

      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream); // Add video tracks to the peer connection
      });
    });
  };

  return (
    <div>
      Sender
      <button onClick={initiateConn}>Send data</button>
    </div>
  );
};
