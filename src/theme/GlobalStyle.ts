import { createGlobalStyle } from 'styled-components';
import theme from './index';

const { colors } = theme;

export const GlobalStyle = createGlobalStyle`
  * {
    font-weight: 300;
    margin: 0;
    padding: 0;
    font-family: Arial, Helvetica, sans-serif;
  }
  body {
    overflow: hidden;
    color: ${colors.text.main};
  }

  *::-webkit-scrollbar {
    display: ${window.navigator.platform === 'MacIntel' ? '' : 'none'}
  }
`;
