import getRoutes from "./routes";

async function checkLogin(setAuthorized: () => void) {
    const res = await fetch(getRoutes().login);
    const data = await res.text();
    if (JSON.parse(data).loggedIn) {
        setAuthorized();
    }
}

export default checkLogin;