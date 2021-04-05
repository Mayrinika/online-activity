export default {
    palette: {
        primary: {
            light: '#749dd2',
            main: '#5285c7',
            dark: '#395d8b',
            contrastText: '#fff'
        },
        secondary: {
            light: '#6d6c6b',
            main: '#494846',
            dark: '#333231',
            contrastText: '#fff'
        },
    },

    content: {
        gameField: {
            // width: 1000,
            height: 500,
            margin: '0 auto',
            backgroundColor: 'rgba(244,244,244,0.85)',
            border: '1px solid black',
            borderRadius: 10,
        },
        imgContainer: {
            marginTop: 48,
            borderRight:'1px solid gray',

            '& .Login-Img': {
                width: 300,
                marginLeft: 'auto',
                marginRight: 'auto',
            }
        },
        loginFormContainer: {
            marginLeft: 'auto',
            marginRight: 'auto',
            marginTop: 48,
            // border: '1px solid gray',
            // borderRadius: 10,
            padding: 48
        },
        loginForm: {
            marginTop: 48,

        }
    }
};