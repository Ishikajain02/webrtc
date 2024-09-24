import { useEffect } from "react";

export const Receiver = () => {
    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8080');
        socket.onopen = () => {
            socket.send(JSON.stringify({
                type: 'identify-as-receiver' // Ensure this matches the server-side logic
            }));
        };
        startReceiving(socket);
    }, []);

    function startReceiving(socket: WebSocket) {
        const video = document.createElement('video');
        video.autoplay = true; // Ensure autoplay is set
        video.style.width = "100%"; // Add styling for visibility
        document.body.appendChild(video);

        const pc = new RTCPeerConnection();
        pc.ontrack = (event) => {
            console.log('Track received:', event.track);
            video.srcObject = new MediaStream([event.track]);
            video.play();
        };

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log('Message received:', message);
            if (message.type === 'createOffer') {
                pc.setRemoteDescription(new RTCSessionDescription(message.sdp)).then(() => {
                    pc.createAnswer().then((answer) => {
                        pc.setLocalDescription(answer);
                        socket.send(JSON.stringify({
                            type: 'createAnswer',
                            sdp: answer
                        }));
                    });
                });
            } else if (message.type === 'iceCandidate') {
                pc.addIceCandidate(new RTCIceCandidate(message.candidate));
            }
        };
    }

    return <div></div>;
};
