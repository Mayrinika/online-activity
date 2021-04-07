export default {
    palette: {
        primary: {
            light: '#749dd2',
            main: '#5285c7',
            dark: '#395d8b',
            contrastText: '#fff'
        },
        secondary: {
            light: '#90b749',
            main: '#75a61c',
            dark: '#517413',
            contrastText: '#fff'
        },
    },

    content: {
        navBarContainer: {
           // backgroundColor: 'rgba(244,244,244,0.85)',
            border: '1px solid black',
            borderRadius: 10,
        },
        navButton: {
            margin: '16px 8px 16px 8px',
        },
        navLink: {
            textDecoration: 'none'
        },
        outerContainer: {
            // width: 1000,
            // height: 500,
            margin: '0 auto',
            padding: 48,
            backgroundColor: 'rgba(244,244,244,0.85)',
            border: '1px solid black',
            borderRadius: 10,
        },
        imgContainer: {
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
            padding: 48
        },
        innerContainer: {
            //marginTop: 48,
            padding: '48px 48px 48px 48px',
            border: '1px solid gray',
            borderRadius: 10,
            backgroundColor: '#F3F3F3'
        },
        playerContainer: {
            borderRadius: 10,
            backgroundColor: '#A1C1EC',
            margin: 8,
            padding: 8,
        },
        button: {
            margin: '32px 16px 16px 16px',
        }
    }
};