import React from 'react';
import { Container } from 'react-bootstrap';
import Header from './header';

const Layout = (props) => {
    return (
        <Container>
            <Header />
            {props.children}
        </Container>
    );
};

export default Layout;
