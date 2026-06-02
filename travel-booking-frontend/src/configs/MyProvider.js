import { useReducer } from "react";
import { CompareContext, MyUserContext } from "./Contexts";
import MyUserReducer from "../reducers/MyUserReducer";
import { getStoredUser } from "../utils/authUtils";
import CompareReducer from "../reducers/CompareReducer";

const MyProvider = ({ children }) => {
    const [user, dispatch] = useReducer(MyUserReducer, getStoredUser());
    const [compare, compareDispatch] = useReducer(CompareReducer, []);

    return (
        <MyUserContext.Provider value={[user, dispatch]}>
            <CompareContext.Provider value={[compare, compareDispatch]}>
                {children}
            </CompareContext.Provider>
        </MyUserContext.Provider>
    );
};

export default MyProvider;
