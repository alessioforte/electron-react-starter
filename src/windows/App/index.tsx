import React, { FC } from 'react';
import { Props } from './interfaces';
import styled from 'styled-components';
import { Helmet } from 'react-helmet';

console.log('App');
const App: FC<Props> = ({ locals }) => {
  return (
    <>
      <Helmet>
        <title>Electron ❤ React</title>
      </Helmet>
      <Body>Electron<span>❤</span>React</Body>
    </>
  );
};

export default App;

const Body = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 42px;
  span {
    color: red;
    margin: 0 12px;
  }
`