import { useContext, useState } from "react";
import { Alert, Button, Form, Table } from "react-bootstrap";
import cookies from 'react-cookies'
import { MyCartContext, MyUserContext } from "../../configs/Contexts";
import { Link } from "react-router-dom";
import Apis, { authApis, endpoints } from "../../configs/Apis";

const Cart = () => {
    const [cart, setCart] = useState(cookies.load('cart') || null)
    const [user, ] = useContext(MyUserContext);
    const [c, cartDispatch] = useContext(MyCartContext);

    const pay = async () => {
        if (window.confirm('Ban chac chan thanh toan?') === true) {
            let cart = cookies.load('cart') || null;
            if (cart !== null) {
                let res = await authApis().post(endpoints['pay'], Object.values(cart));
                if (res.status === 201) {
                    setCart([]);
                    cartDispatch({
                        "type": "PAID"
                    });
                }
            }
            
        }
    }

    const updateCartItem = (e, productId) => {
        if (cart !== null && productId in cart) {
            let updatedCart = {...cart, [productId]: {
                ...cart[productId],
                'quantity': parseInt(e.target.value)
            }};
            setCart(updatedCart);

            cookies.save('cart', updatedCart);

            cartDispatch({
                "type": "UPDATE"
            });
        }
    }

    return (
        <>
            <h1 className="text-center text-success mt-1">GIỎ HÀNG</h1>

            {cart === null || cart.length == 0 ? <Alert>KHÔNG có sản phẩm trong giỏ!</Alert>:<>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th>Tên sản phẩm</th>
                            <th>Đơn giá</th>
                            <th>Số lượng</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.values(cart).map(c => <tr key={c.id}>
                            <td>{c.id}</td>
                            <td>{c.name}</td>
                            <td>{c.price.toLocaleString()} VNĐ</td>
                            <td>
                                <Form.Control type="number" value={c.quantity} onChange={e => updateCartItem(e, c.id)} />
                            </td>
                            <td>
                                <Button variant="danger">&times;</Button>
                            </td>
                        </tr>)}
                    </tbody>
                    </Table>

                    <Alert variant="info">
                        <h3>Tong tien: {c.totalAmount.toLocaleString()} VND</h3>
                        <h3>Tong so luong: {c.totalQuantity}</h3>
                    </Alert>

                    {user === null?<Alert>Vui lòng <Link to="/login?next=/cart">đăng nhập</Link> để thanh toán</Alert>:<Button onClick={pay} className="mb-1" variant="success">Thanh toán</Button>}
            </>}

            
        </>
    );
}

export default Cart;