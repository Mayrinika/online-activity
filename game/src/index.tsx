import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter} from 'react-router-dom';
import reportWebVitals from './reportWebVitals';
//components
import App from './components/App/App';
import NavigationBar from "./components/NavigationBar/NavigationBar";
//utils
import themeFile from './utils/theme';
//styles
import './index.css';
import {MuiThemeProvider, createMuiTheme} from '@material-ui/core/styles';
import ApiClient from "./components/Api/ApiClient";

import {ApiClientContext} from './components/Api/apiClientContext';

const theme = createMuiTheme(themeFile);

ReactDOM.render(
    <MuiThemeProvider theme={theme}>
        <React.StrictMode>
            <BrowserRouter>
                <ApiClientContext.Provider value={new ApiClient('')}>
                    <NavigationBar/>
                    <App/>
                </ApiClientContext.Provider>
            </BrowserRouter>
        </React.StrictMode>,
    </MuiThemeProvider>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
