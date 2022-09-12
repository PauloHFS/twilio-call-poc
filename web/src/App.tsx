import { useLayoutEffect, useRef, useState } from 'react';
import './App.css';
import { createLocalVideoTrack, connect, Room } from 'twilio-video';
import axios from 'axios';

function App() {
  const [room, setRoom] = useState<Room>();
  const [name, setName] = useState();
  const [roomName, setRoomName] = useState();

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();

  useLayoutEffect(() => {
    createLocalVideoTrack().then(track => {
      track.attach(localVideoRef.current);
      return () => {
        track.detach(localVideoRef.current);
      };
    });
  });

  const handleConnect = () => {
    axios
      // .post('https://twilio-call-poc.herokuapp.com/token', {
      .post('http://localhost:3333/token', {
        roomName: roomName,
        identity: name,
      })
      .then(response => {
        console.log(response);
        connect(response.data.token, {
          audio: true,
          video: true,
          name: roomName,
        }).then(room => {
          setRoom(room);
          console.log('connected at', room);

          room.on('participantConnected', participant => {
            console.log(`Participant "${participant.identity}" connected`);

            participant.tracks.forEach(publication => {
              if (publication.isSubscribed) {
                publication.track.attach(remoteVideoRef.current);
              }
            });

            participant.on('trackSubscribed', track => {
              track.attach(remoteVideoRef.current);
            });
          });
        });
      })
      .catch(error => console.error(error));
  };

  const handleDisconnect = () => {
    if (room) {
      room.disconnect();
    }
  };

  return (
    <div>
      <div>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <label htmlFor="roomName">Room Name</label>
        <input
          id="roomName"
          type="text"
          onChange={e => setRoomName(e.target.value)}
          value={roomName}
        />
        <button onClick={handleConnect}>Connect</button>
        <button onClick={handleDisconnect} disabled={!room}>
          Disconnect
        </button>
      </div>
      <video ref={localVideoRef} />
      <video ref={remoteVideoRef} />
    </div>
  );
}

export default App;
