import React from 'react';
import { Container } from 'semantic-ui-react';
import Head from 'next/head'; //wrapping any link tags inside a Head will auto
//move this tag to the head of the html doc
import { Link } from '../routes.js';

const Layout = (props) => {
    return (
        <Container>
            <Head>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/semantic-ui@2/dist/semantic.min.css" />
            </Head>
            <Link route={`/`}>
                <h1 style={{marginTop: "20px", cursor: "pointer"}}>Story Factory</h1>
            </Link>
            {props.children}
        </Container>
    );
};

export default Layout;
