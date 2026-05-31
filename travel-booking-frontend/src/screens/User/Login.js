import { useContext, useRef, useState } from "react";
import { Alert, Button, Form } from "react-bootstrap";
import MySpinner from "../../components/MySpinner";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import { useNavigate, useSearchParams } from "react-router-dom";
import cookies from 'react-cookies'
import { MyUserContext } from "../../configs/Contexts";

const Login = () => {
    const userInfo = [{
        field: "username",
        label: "Tên đăng nhập", 
        type: "text"
    }, {
        field: "password",
        label: "Mật khẩu", 
        type: "password"
    }];

    const [user, setUser] = useState({})
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);
    const [, dispatch] = useContext(MyUserContext);
    const [q] = useSearchParams();
   
    const nav = useNavigate();

    const validate = () => {
    
        return true;
    }

    const login = async (e) => {
        e.preventDefault();

        if (validate()) {
            try {
                setLoading(true);

                let res = await Apis.post(endpoints['login'], {...user});
                cookies.save('token', res.data.token);

            //    setTimeout(async () => {
                let p = await authApis().get(endpoints['profile']);
                console.info(p.data);
                cookies.save('user', p.data);

                dispatch({
                    "type": "LOGIN",
                    "payload": p.data
                })
                let next = q.get('next')
                if (next)
                    nav(next);
                else
                    nav('/');

            //    }, 500)
            } catch (ex) {
                console.error(ex);
            } finally {
                setLoading(false);
            }
        }
    }

    return (
        <>
            <h1 className="text-center text-success mt-1">ĐĂNG NHẬP NGƯỜI DÙNG</h1>

            {err && <Alert variant="danger">{err}</Alert>}

            <Form onSubmit={login}>
                {userInfo.map(u => <Form.Group key={u.field} className="mb-3" controlId={u.field}>
                    <Form.Label>{u.label}</Form.Label>
                    <Form.Control type={u.type} placeholder={u.label} value={user[u.field]} onChange={e => setUser({...user, [u.field]: e.target.value})} required />
                </Form.Group>)}

                <Form.Group className="mb-3">
                    {loading === true ? <MySpinner /> : <Button variant="success" type="submit">Đăng nhập</Button>}
                </Form.Group>
            </Form>
        </>
    );
}

export default Login;