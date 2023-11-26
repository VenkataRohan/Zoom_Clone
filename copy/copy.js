import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { Peer } from "peerjs";
import CustomImage from './img.png'
import ReactPlayer from 'react-player'

// const myPeer = new Peer(undefined, {
//   host: '/',
//   port: '3001'
// })
const socket = io('https://webrtc-backend-hq7d.onrender.com')
//const socket = io('http://localhost:8000')
const myPeer = new Peer()
//const screensharePeer = new Peer()
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
  const [scpeer,setscpeer]=useState()
  useEffect(() => {
    // Create a WebSocket connection to the server
    // const socket = io('http://localhost:8000')//io('https://webrtc-backend-bfblx66zz-venkatarohank-gmailcom.vercel.app'); // Replace with your server's address

    //  navigator.mediaDevices.getDisplayMedia({
    //   video: {
    //       cursor: "always"
    //   },
    //   audio: false
    ////console.log(socket);
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
          //  setscreenShare()
           // setscreenShare((prev)=>{
        //       console.log(prev);
        //       if(prev){
        //       //   const v = prev[0].props.stream.getTracks().find((ele) => ele.kind === 'video')
        //       //   //console.log(prev[0].props.stream);
        //       //  // console.log(v);
        //       // //  prev[0].props.stream.removeTrack(v)
        //       //   prev[0].props.stream.addTrack(userVideoStream.getTracks().find((ele) => ele.kind === 'video'))
        //       //   return prev
        //       // return [...prev,<AddVideoStream userid={call.peer} playing={true} own={false} stream={userVideoStream}/>]
        //       return [ <div className="video-window"><ReactPlayer
        //   playsinline // very very imp prop
        //   pip={false}
        //   //light={CustomImage}
        //   controls={false}
        //   // playIcon={false}
        //   muted={true}//own
        //   playing={true}
        //   //
        //   url={userVideoStream}//{"https://www.youtube.com/watch?v=DvlyzDZDEq4"}//{videoStream}
        //   //
        //   height={"300px"}
        //   width={"300px"}
        //   className="video-window"
        //   onError={(err) => {
        //     ////console.log(err, "participant video error");
        //   }}
        // />
        //   <p>{call.peer}</p>
        // </div>]
        //       }
             // return [<AddVideoStream userid={call.peer} playing={true} own={false} stream={userVideoStream}/>]
            // })
            console.log(userVideoStream.getTracks());
            console.log(userVideoStream);
            console.log("scerwafsdcsdfasdfasfasdf");
          } else {
            setarr((prev) => [...prev, <AddVideoStream userid={call.peer} playing={true} own={false} stream={userVideoStream} />])
         }

          call.on('close', (val) => {
            ////console.log("closse");
            ////console.log(val);
          })

        })
      })

      socket.on('user-connected', userId => {
        var call = connectToNewUser(userId, stream)
        // setCalls((prev) => [...prev, call])
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
      ////console.log(val);
      setMsgArr((prev) => [...prev, <div className="chat-message"><p className='normal-text'>{val}</p> <p className='subscript-text'>{soc_id}</p></div>])
    })


    // socket.on('disconnect', () => {
    //   ////console.log('Disconnected from the WebSocket server');
    // });

    // Clean up the WebSocket connection when the component unmounts

    socket.on('server_stop_screenshare', () => {
          setscreenShare()
      })

    socket.on('server_screenshare', usrId => {
      //console.log(usrId);
      // navigator.mediaDevices.getUserMedia({
      //   video: false,
      //   audio: true
      // }).then(str => {
      console.log(usrId);
      var pp
      const call = myPeer.call(usrId, new MediaStream())
      console.log(call);
      call.on('stream', userVideoStream => {
        console.log("usr call");
        setarr((prev) => [...prev, <AddVideoStream userid={usrId} playing={true} own={false} stream={userVideoStream} screenShare={true} />])
        // })

      })


      // setCalls((prev) => [...prev, call])
      ////console.log(calls);
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
  //   screensharePeer.on('call', call => {
  //     call.answer(strea)
  //     console.log("got call");
  //     call.once('stream', (userVideoStream) => {
  //       console.log("un stream");
  //       //console.log(userVideoStream);
  //       //console.log(userVideoStream.getTracks());
  //       ////console.log(userVideoStream);
  //       ////console.log(call.peer);
  //      // setarr((prev) => [...prev, <AddVideoStream userid={call.peer} playing={true} own={false} stream={userVideoStream} />])
  //       //console.log(call.peerConnection.getSenders());
  //       call.on('close', (val) => {
  //         ////console.log("closse");
  //         ////console.log(val);
  //       })

  //     })
  //     //console.log(stream);
  // })
  // socket.once('server_screenshare', usrId => {
  //   //console.log(usrId);
  //   navigator.mediaDevices.getUserMedia({
  //     video: true,
  //     audio: true
  //   }).then(str => {
  //     //console.log(usrId);
  //     const call = myPeer.call(usrId,str)
  //     //console.log(call);
  //     call.once('stream', userVideoStream => {
  //       //console.log(userVideoStream);
  //       //console.log(userVideoStream.getTracks());
  //     // setscreenShare(userVideoStream)
  //        setarr((prev) => [...prev, <AddVideoStream userid={usrId} playing={true} own={false} stream={userVideoStream} screenShare={true} />])
  //   })

  //   })


  //  // setCalls((prev) => [...prev, call])
  //   ////console.log(calls);
  // })

  socket.once("server_track_toggle", (usrid, soc_id, isvideoplaying, trackType) => {
    //console.log("sdfasdfd   " + isvideoplaying);
    setarr((prev) => {
      const temp = prev.map((val) => {
        if (val.props.userid === usrid) {
          // Replace the component with the new key
          //console.log(val.props.stream.getTracks());
          //val.props.stream.getTracks()
          return <AddVideoStream userid={usrid} playing={isvideoplaying} stream={val.props.stream} own={false} />
        }
        return val
      });
      //console.log(temp);
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
      // }else{
      //   Object.keys(screensharePeer.connections).forEach((ele) => {
      //   const v = screenstream.getTracks().find((ele) => ele.kind === 'video')
      //   screensharePeer.connections[ele][0].peerConnection.getSenders()[0].replaceTrack(v)
      //   })
      // }
      
      console.log(screensharePeer);
      // screensharePeer.on('call', call => {
      //     call.answer(strea)
      //     console.log("got call");
      //     call.once('stream', (userVideoStream) => {
      //       console.log("un stream");

      //       call.on('close', (val) => {
      //         ////console.log("closse");
      //         ////console.log(val);
      //       })

      //     })
      //     //console.log(stream);
      // })
      //  socket.emit('screenshare',screensharePeer.id)
      console.log(screensharePeer.id);
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
          <p>{scpeer?scpeer.id:"12"}</p>
          { scpeer&& <button onClick={() => {
          // Object.keys(screensharePeer.connections).forEach((ele)=>{
          //  // if(screensharePeer.connections[ele]){
          //   //  screensharePeer.connections[ele][0].close()
          //     console.log(screensharePeer.connections[ele][0].dataChannel.close());
          //   //}
          // })
          // console.log(screensharePeer);
          Object.keys(scpeer.connections).forEach((ele)=>{
            scpeer.connections[ele][0].peerConnection.getSenders()[0].track.stop();
            // screensharePeer.connections[ele][0].peerConnection.getSenders()[1].track.stop();
          })
          socket.emit("stop_screenshare")
          setscreenShare()
          setscpeer()
          //screensharePeer.connections={}
          // console.log(screensharePeer._cleanup());
          // setscreenShare()
          // console.log(screensharePeer);
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
          {/* Add controls like mute, video on/off, screen sharing, etc. */}
          {/* <button onClick={() => {
          ////console.log(streamm);
          if (streamm) {
            if (video) {
              const cam_per=navigator.permissions.query({name:"camera"})
              //console.log(navigator.permissions)
            
              const v_track = streamm.getTracks().find((ele) => ele.kind === 'video')
              v_track.stop()
            //  v_track.enabled=false
             //v_track.muted=true
              //console.log(v_track);
             // streamm.removeTrack(v_track)
            } else {
              navigator.mediaDevices.getUserMedia({
                video: true,
              }).then(stream => {
                setStream((prev) => {
                  ////console.log(stream.getTracks().find((ele)=>ele.kind==='video'));
                  //console.log(stream.getTracks());
                  const v_track = streamm.getTracks().find((ele) => ele.kind === 'video')
                  prev.removeTrack(v_track)
                    prev.addTrack(stream.getTracks()[0])
                    
                    //console.log(prev.getTracks());
                  return prev
                })
              })
              const v_track = streamm.getTracks().find((ele) => ele.kind === 'video')
              v_track.enabled=true
              //console.log(v_track);
            }
            socket.emit("video_toggle", myPeer.id, socket.id, !video)
            setVideo(!video)
          }
        }}>{video ? "Video off" : "Video on"}</button> */}
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
                  if(v){
                    myPeer.connections[ele][0].peerConnection.getSenders()[1].replaceTrack(v)
                    setStream((prev) => {
                      const v_track = prev.getTracks().find((ele) => ele.kind === 'video')
                      prev.removeTrack(v_track)
                      prev.addTrack(v)
                      return prev
                    })
                  }else{

                  }
                 
                })
              }
              //  //console.log(ReactPlayer);
              setVideo(!video)
            })

          }}>{video ? "Video off" : "Video on"}</button>
          <button onClick={openPopup}>Chat</button>
          <button onClick={openScreenSharePopup}>Screen Share</button>
          {/* <button onClick={() => {
            ////console.log(calls);
            calls.forEach((call) => {
              call.close()
            })

          }}>leave</button> */}
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


// {screenShare&& <div className="screen-share-container">
// <h1 className="screen-share-title">Screen Sharing App</h1>
// <button className="screen-share-button">Start Sharing</button>
// {/* Display the shared screen/video */}
// <AddVideoStream  playing={true} own={false} stream={screenShare}/>
// </div>}