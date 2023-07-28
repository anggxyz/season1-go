'use client'
/* eslint-disable @typescript-eslint/no-unsafe-return */
import React, { type ReactElement } from 'react';
import styled from 'styled-components';
import Nav from 'src/components/Nav';
const Wrapper = styled.div`
  padding: 5rem 2rem 2rem 2rem;
  background: ${({ theme }) => theme.desktopBackground};
  height: 100vh;
  @media (max-width: 768px) {
    height: 100%;
  }
`;

export default function Main ({children}: {children?: ReactElement}) {
  return (
    <Wrapper>
      <Nav/>
      {children}
    </Wrapper>
  )
}