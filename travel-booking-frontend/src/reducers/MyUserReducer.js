import cookies from 'react-cookies'
import { clearAuthSession } from '../utils/authUtils';


const MyUserReducer = (current, action) => {
    switch (action.type) {
        case "LOGIN": {
            const user = action.payload.user || action.payload;
            const token = action.payload.token;

            clearAuthSession();

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
            clearAuthSession();
            return null;
        default:
            return current;
    }
}

export default MyUserReducer;
