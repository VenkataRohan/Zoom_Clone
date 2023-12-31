import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { Peer } from "peerjs";
import CustomImage from './img.png'
import ReactPlayer from 'react-player'


const socket = io('https://webrtc-backend-hq7d.onrender.com')
//const socket = io('http://localhost:8000')
const myPeer = new Peer()

function App() {
  const [arr, setarr] = useState([])
  const [streamm, setStream] = useState([])
  const [msgArr, setMsgArr] = useState([])
  const [showPopup, setShowPopup] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [video, setVideo] = useState(true)
  const [audio, setAudio] = useState(true)
  const [screenShare, setscreenShare] = useState()
  const [calls, setCalls] = useState([])
  const [scpeer, setscpeer] = useState()
  useEffect(() => {

    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    }).then(stream => {
      console.log(stream);
      console.log(stream.getTracks());
      setStream(stream)
      setarr([<AddVideoStream id={socket.id} playing={true} stream={stream} own={true} />])
      myPeer.on('call', call => {
        call.answer(stream)
        console.log(call);


        call.once('stream', (userVideoStream) => {
          if (call.metadata && call.metadata.includes("screenshare")) {
            console.log(screenShare);
            setscreenShare(userVideoStream)
            console.log(userVideoStream);

            console.log(userVideoStream.getTracks());
            console.log(userVideoStream);
            console.log("scerwafsdcsdfasdfasfasdf");
          } else {
            setarr((prev) => [...prev, <AddVideoStream userid={call.peer} playing={true} own={false} stream={userVideoStream} />])
          }

          call.on('close', (val) => {

          })

        })
      })

      socket.on('user-connected', userId => {
        var call = connectToNewUser(userId, stream)

      })
    })


    myPeer.on('open', id => {
      socket.emit('join-room', "1", id)
    })

    function connectToNewUser(userId, stream) {
      const call = myPeer.call(userId, stream)
      call.once('stream', userVideoStream => {
        setarr((prev) => [...prev, <AddVideoStream userid={userId} playing={true} own={false} stream={userVideoStream} />])
      })

      return call
    }


    socket.on("newMsg", (val, soc_id) => {
      setMsgArr((prev) => [...prev, <div className="chat-message"><p className='normal-text'>{val}</p> <p className='subscript-text'>{soc_id}</p></div>])
    })


    // Clean up the WebSocket connection when the component unmounts

    socket.on('server_stop_screenshare', () => {
      setscreenShare()
    })

    socket.on('server_screenshare', usrId => {

      console.log(usrId);
      var pp
      const call = myPeer.call(usrId, new MediaStream())
      console.log(call);
      call.on('stream', userVideoStream => {
        console.log("usr call");
        setarr((prev) => [...prev, <AddVideoStream userid={usrId} playing={true} own={false} stream={userVideoStream} screenShare={true} />])


      })


    })

    return () => {

      socket.disconnect(socket.id);
    };
  }, []);
  socket.once('user-disconnected', (soc_id, usrid) => {
    setarr((prev) => {
      const temp = prev.filter((val) => {
        return val.props.userid !== usrid
      })
      return temp
    })
  })


  socket.once("server_track_toggle", (usrid, soc_id, isvideoplaying, trackType) => {

    setarr((prev) => {
      const temp = prev.map((val) => {
        if (val.props.userid === usrid) {
          return <AddVideoStream userid={usrid} playing={isvideoplaying} stream={val.props.stream} own={false} />
        }
        return val
      });
      return temp
    })
  })
  function AddVideoStream({ stream, playing, own, userid }) {
    //console.log(stream.getTracks());
    return <div>
      {!playing || (!video && own) ?
        <div className="video-window">

          <img className="img-window" src={CustomImage} alt="Image Description" />
          <p>{userid ? userid : myPeer.id} </p>
        </div> :
        <div className="video-window"><ReactPlayer
          playsinline // very very imp prop
          pip={false}
          //light={CustomImage}
          controls={false}
          // playIcon={false}
          muted={true}//own
          playing={true}
          //
          url={stream}//{"https://www.youtube.com/watch?v=DvlyzDZDEq4"}//{videoStream}
          //
          height={"300px"}
          width={"300px"}
          className="video-window"
          onError={(err) => {
            ////console.log(err, "participant video error");
          }}
        />
          <p>{userid ? userid : myPeer.id}</p>
        </div>
      }
      {/* )} */}
    </div>
  }
  const openScreenSharePopup = () => {
    const screensharePeer = new Peer()
    setscpeer(screensharePeer)
    navigator.mediaDevices.getDisplayMedia({
      video: true//{ cursor: "always" }
    }).then((screenstream) => {
      // if(Object.keys(screensharePeer.connections).length==0){
      Object.keys(myPeer.connections).forEach((ele) => {
        screensharePeer.call(ele, screenstream, { metadata: "screenshare" })
      })
      screensharePeer.call(myPeer.id, screenstream, { metadata: "screenshare" })


    })

  }
  const openPopup = () => {
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };
  return (
    <div>
      {screenShare && <div >
        <div className="screen-share-container"><ReactPlayer
          playsinline // very very imp prop
          pip={false}
          //light={CustomImage}
          controls={false}
          // playIcon={false}
          muted={true}//own
          playing={true}
          //
          url={screenShare}//{"https://www.youtube.com/watch?v=DvlyzDZDEq4"}//{videoStream}
          //
          height={"70%"}
          width={"70%"}
          // className="video-window"
          onError={(err) => {
            ////console.log(err, "participant video error");
          }}
        />
          <p>{scpeer ? scpeer.id : "12"}</p>
          {scpeer && <button onClick={() => {
            Object.keys(scpeer.connections).forEach((ele) => {
              scpeer.connections[ele][0].peerConnection.getSenders()[0].track.stop();
              // screensharePeer.connections[ele][0].peerConnection.getSenders()[1].track.stop();
            })
            socket.emit("stop_screenshare")
            setscreenShare()
            setscpeer()

          }}>Close</button>}
        </div>
        {/* <AddVideoStream userid={scpeer?scpeer.id:"12"} playing={true} stream={screenShare} own={false} /> */}
        {/* <ReactPlayer
          playsinline // very very imp prop
          pip={false}
          //light={CustomImage}
          controls={false}
          // playIcon={false}
          muted={true}//own
          playing={true}
          //
          url={screenShare}//{"https://www.youtube.com/watch?v=DvlyzDZDEq4"}//{videoStream}
          //
          height={"300px"}
          width={"300px"}
          className="video-window"
          onError={(err) => {
            ////console.log(err, "participant video error");
          }}
        /> */}

        {/* <AddVideoStream playing={true} own={false} stream={screenShare} /> */}

      </div>}
      <div className="video-conference-container">
        <div className="video-grid">
          {arr}
          {/* Add more remote video windows as needed */}
        </div>
        <div className="controls">

          <button onClick={() => {

            if (streamm) {
              const a_track = streamm.getTracks().find((ele) => ele.kind === 'audio')
              if (audio) {
                a_track.enabled = false
              } else {
                a_track.enabled = true
              }
              setAudio(!audio)
            }
          }}>{audio ? "mute" : "unmute"}</button>
          <button onClick={() => {
            Object.keys(myPeer.connections).forEach((ele) => {
              socket.emit("track_toggle", myPeer.id, socket.id, !video, "video")
              if (video) {
                console.log();
                myPeer.connections[ele][0].peerConnection.getSenders()[1].track.stop();
              } else {
                navigator.mediaDevices.getUserMedia({
                  video: true,
                }).then((stream) => {
                  const v = stream.getTracks().find((ele) => ele.kind === 'video')
                  if (v) {
                    myPeer.connections[ele][0].peerConnection.getSenders()[1].replaceTrack(v)
                    setStream((prev) => {
                      const v_track = prev.getTracks().find((ele) => ele.kind === 'video')
                      prev.removeTrack(v_track)
                      prev.addTrack(v)
                      return prev
                    })
                  } else {

                  }

                })
              }
              //  //console.log(ReactPlayer);
              setVideo(!video)
            })

          }}>{video ? "Video off" : "Video on"}</button>
          <button onClick={openPopup}>Chat</button>
          <button onClick={openScreenSharePopup}>Screen Share</button>
          {showPopup && (
            <div className="popup">
              <div className="popup-content">
                <div className="chat-container">
                  <div className="chat-header">Chat Room</div>
                  <div className="chat-messages">

                    {msgArr}
                    {/* Add more chat messages here */}
                  </div>
                  <div className="chat-input">
                    <input className="chat-input-field" type="text" placeholder="Type a message..." value={inputVal} onChange={(e) => {
                      setInputVal(e.target.value)
                    }} />
                    <button className="send-button" onClick={() => {
                      ////console.log(inputVal);
                      setMsgArr((prev) => [...prev, <div className="user-message"><p className='normal-text'>{inputVal}</p> <p className='subscript-text'>{socket.id}</p></div>])
                      socket.emit("recieveMsg", inputVal, socket.id)
                      setInputVal("")
                    }}>Send</button>
                  </div>
                </div>
                <button onClick={closePopup}>Close</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

