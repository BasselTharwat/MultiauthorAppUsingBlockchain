/*
import React from "react";
require('dotenv').config({path: '../.env'});

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL
  ? process.env.NEXT_PUBLIC_GATEWAY_URL
  : "https://gateway.pinata.cloud";


export default function Files(props) {
  return (
    <div className="file-viewer">
      <p>Your IPFS CID:</p>
      <p>{props.chapterCid}</p>
      <a
        href={`${GATEWAY_URL}/ipfs/${props.chapterCid}?pinataGatewayToken=${process.env.NEXT_PUBLIC_GATEWAY_TOKEN}`}
        rel="noopener noreferrer"
        target="_blank"
      >
        View file
      </a>
    </div>
  );
}
*/


/*
import React from "react";
require('dotenv').config({path: '../.env'});

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL
  ? process.env.NEXT_PUBLIC_GATEWAY_URL
  : "https://gateway.pinata.cloud";


export default function Files(props) {
  return (
      <a
        href={`${GATEWAY_URL}/ipfs/${props.chapterCid}?pinataGatewayToken=${process.env.NEXT_PUBLIC_GATEWAY_TOKEN}`}
        rel="noopener noreferrer"
        target="_blank"
      >
        {props.chapterCid}
      </a>
  );
}
*/


import React, { useState, useEffect } from "react";
require('dotenv').config({path: '../.env'});

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL
  ? process.env.NEXT_PUBLIC_GATEWAY_URL
  : "https://gateway.pinata.cloud";

export default function Files(props) {
  const [fileContent, setFileContent] = useState(null);
  const [fileType, setFileType] = useState(null);

  useEffect(() => {
    const fetchFileContent = async () => {
      try {
        const response = await fetch(`${GATEWAY_URL}/ipfs/${props.chapterCid}?pinataGatewayToken=${process.env.NEXT_PUBLIC_GATEWAY_TOKEN}`);
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('text')) {
            const data = await response.text();
            setFileContent(data);
            setFileType('text');
          } else if (contentType && contentType.includes('image')) {
            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            setFileContent(imageUrl);
            setFileType('image');
          } else if (contentType && contentType.includes('audio')) {
            const blob = await response.blob();
            const audioUrl = URL.createObjectURL(blob);
            setFileContent(audioUrl);
            setFileType('audio');
          } else if (contentType && contentType.includes('video')) {
            const blob = await response.blob();
            const videoUrl = URL.createObjectURL(blob);
            setFileContent(videoUrl);
            setFileType('video');
          } else {
            console.error('Unsupported file type:', contentType);
          }
        } else {
          console.error('Failed to fetch file:', response.status);
        }
      } catch (error) {
        console.error('Error fetching file:', error);
      }
    };

    fetchFileContent();
  }, [props.chapterCid]);

  return (
    <>
      {fileType === 'text' && fileContent && (
        <pre>{fileContent}</pre>
      )}
      {fileType === 'image' && fileContent && (
        <div className="d-flex justify-content-center align-items-center"> {/*style={{ width: '286px', height: '180px' }}*/}
          <img src={fileContent} alt="Image" style={{ maxWidth: '100%', maxHeight: '100%' }} />
        </div>
      )}
      {fileType === 'audio' && fileContent && (
        <audio controls>
          <source src={fileContent} type="audio/mp3" />
        </audio>
      )}
      {fileType === 'video' && fileContent && (
        <video controls>
          <source src={fileContent} type="video/mp4" />
        </video>
      )}
    </>
  );
}
