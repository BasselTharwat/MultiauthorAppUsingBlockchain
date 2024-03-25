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
