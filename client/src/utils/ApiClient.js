import CookieManager from "./CookieManager";
require("dotenv").config();

const METRINOME_BACKEND_URL = process.env.REACT_APP_URL || "http://localhost:3001";

const ApiClient = (endpoint, { body, ...customConfig } = {}) => {
    const token = CookieManager.getUserToken();
    const headers = { "content-type": "application/json" };
    if (token) {
        headers.Authorization = `${token}`;
    }
    const config = {
        method: body ? "POST" : "GET",
        ...customConfig,
        headers: {
            ...headers,
            ...customConfig.headers,
        },
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    const url = `${METRINOME_BACKEND_URL}/${endpoint}`;

    console.log(url);

    return window.fetch(`${METRINOME_BACKEND_URL}/${endpoint}`, config).then(async (res) => {
        if (res.status === 401) {
            logout();
            window.location.assign(window.location);
            return Promise.reject({ message: "Please re-authenticate" });
        }
        const text = await res.text();
        const data = text.length ? JSON.parse(text) : {};
        if (res.ok) {
            return data;
        } else {
            return Promise.reject(data);
        }
    });
};

const logout = () => {
    CookieManager.removeUserToken();
};

export default ApiClient;
