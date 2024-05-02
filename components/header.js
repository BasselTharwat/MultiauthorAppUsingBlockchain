import React from "react";
import { Button } from 'react-bootstrap';
import { Link } from '../routes.js';

export default () => {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px" }}>
                <Link route={`/`}>
                    <h1 style={{ cursor: "pointer" }}>Story Factory</h1>
                </Link>
            </div>
        
    )
}