import { useRef, useState } from "react";
import { Alert, Button, Form } from "react-bootstrap";
import MySpinner from "../../components/MySpinner";
import Apis, { endpoints } from "../../configs/Apis";
import { useNavigate } from "react-router-dom";

const Register = () => {
    const userInfo = [{
        field: "firstName",
        label: "Tên", 
        type: "text"
    }, {
        field: "lastName",
        label: "Họ và tên lót", 
        type: "text"
    }, {
        field: "phone",
        label: "Số điện thoại", 
        type: "tel"
    }, {
        field: "email",
        label: "Email", 
        type: "email"
    }, {
        field: "username",
        label: "Tên đăng nhập", 
        type: "text"
    }, {
        field: "password",
        label: "Mật khẩu", 
        type: "password"
    }, {
        field: "confirm",
        label: "Xác nhận mật khẩu", 
        type: "password"
    }];

    const [user, setUser] = useState({})
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);
    const avatar = useRef();
    const nav = useNavigate();

    const validate = () => {
        if (user.password !== user.confirm) {
            setErr('Mật khẩu không khớp!');
            return false;
        }

        return true;
    }

    const register = async (e) => {
        e.preventDefault();

        if (validate()) {
            let form = new FormData();

            for (var key of Object.keys(user)) {
                if (key !== 'confirm')
                    form.append(key, user[key]);
            }

            if (avatar.current.files.length > 0)
                form.append('avatar', avatar.current.files[0]);

            try {
                setLoading(true);
                const res = await Apis.post(endpoints['register'], form, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                if (res.status === 201)
                    nav('/login');
            } catch (ex) {
                console.error(ex);
            } finally {
                setLoading(false);
            }
        }
    }

    return (
        <>
            <h1 className="text-center text-success mt-1">ĐĂNG KÝ NGƯỜI DÙNG</h1>

            {err && <Alert variant="danger">{err}</Alert>}

            <Form onSubmit={register}>
                {userInfo.map(u => <Form.Group key={u.field} className="mb-3" controlId={u.field}>
                    <Form.Label>{u.label}</Form.Label>
                    <Form.Control type={u.type} placeholder={u.label} value={user[u.field]} onChange={e => setUser({...user, [u.field]: e.target.value})} required />
                </Form.Group>)}

                <Form.Group className="mb-3" controlId="avatar">
                    <Form.Label>Ảnh đại diện</Form.Label>
                    <Form.Control ref={avatar} type="file" required />
                </Form.Group>

                <Form.Group className="mb-3">
                    {loading === true ? <MySpinner /> : <Button variant="success" type="submit">Đăng ký</Button>}
                </Form.Group>
            </Form>
        </>
    );
}

export default Register;