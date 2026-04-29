import axios from "axios";
// import URLHelper from "./urlHelper";

class HTTPClient {
    constructor() {
        axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_BASE;// URLHelper.base;
        // axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
        axios.defaults.headers.post['Content-Type'] = 'application/json';
        axios.defaults.withCredentials = true;
        axios.interceptors.response.use(function (response) {
            return response;
        }, function (error) {
            return error.response || { data: { status: 'error', msg: 'Network or server error' } };
        });
    }

    get = async (url) => {
        const response = await axios.get(url);
        return response.data;
    }

    post = async (url, jsonBody) => {
        const response = await axios.post(url, jsonBody);
        return response.data;
    }

    put = async (url, jsonBody) => {
        const response = await axios.put(url, jsonBody);
        return response.data;
    }
}

const httpClient = new HTTPClient();

export default httpClient;