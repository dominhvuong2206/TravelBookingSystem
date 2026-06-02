import cookies from 'react-cookies'
import { AUTH_COOKIE_PATHS } from '../utils/authUtils';

const removeAuthCookies = () => {
    cookies.remove('token');
    cookies.remove('user');

    for (let path of AUTH_COOKIE_PATHS) {
        cookies.remove('token', { path });
        cookies.remove('user', { path });
    }
};


const MyUserReducer = (current, action) => {
    switch (action.type) {
        case "LOGIN": {
            const user = action.payload.user || action.payload;
            const token = action.payload.token;

            removeAuthCookies();

            if (token) {
                cookies.save("token", token, { path: "/" });
                localStorage.setItem("token", token);
            }

            cookies.save("user", user, { path: "/" });
            localStorage.setItem("user", JSON.stringify(user));

            return user;
        }
        case "UPDATE_USER": {
            const user = action.payload.user || action.payload;
            cookies.save("user", user, { path: "/" });
            localStorage.setItem("user", JSON.stringify(user));

            return user;
        }
        case "LOGOUT":
            removeAuthCookies();
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            return null;
        default:
            return current;
    }
}

export default MyUserReducer;
