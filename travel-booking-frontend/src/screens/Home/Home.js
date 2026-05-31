import { useContext, useEffect, useState } from "react";
import MySpinner from "../../components/MySpinner";
import Apis, { endpoints } from "../../configs/Apis";
import { Alert, Button, Card, Col, Row } from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";
import cookies from 'react-cookies'
import { MyCartContext } from "../../configs/Contexts";

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [q] = useSearchParams();
    const [, dispatch] = useContext(MyCartContext);
    const nav = useNavigate();

    const loadProducts = async () => {
        try {
            setLoading(true);

            let url = `${endpoints['products']}?page=${page}`;

            const cateId = q.get("cateId");
            if (cateId) {
                url = `${url}&cateId=${cateId}`;
            }

            const kw = q.get("kw")
            if (kw) {
                url = `${url}&kw=${kw}`;
            }

            let res = await Apis.get(url);
            
            if (res.data.length === 0)
                setPage(0);
            if (page === 1)
                setProducts(res.data);
            else 
                setProducts([...products, ...res.data]);
        } catch (ex) {

        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadProducts();
    }, [q, page]);

    useEffect(() => {
        setPage(1);
    }, [q]);

    const loadMore = () => {
        setPage(page + 1);
    }

    const order = (p) => {
        let cart = cookies.load('cart') || null;
        if (cart === null)
            cart = {}

        if (p.id in cart) {
            cart[p.id]['quantity']++;
        } else {
            cart[p.id] = {
                'id': p.id,
                'name': p.name,
                'price': p.price,
                'quantity': 1
            }
        }

        cookies.save('cart', cart);
        dispatch({
            "type": "UPDATE"
        })
    }

    return (
        <>
            {products.length == 0 && <Alert variant="info" className="mt-2">KHÔNG có sản phẩm nào!</Alert>}
            <Row>
                {products.map(p => <>
                    <Col xs={6} md={3} key={p.id} className="p-2">
                        <Card>
                            <Card.Img variant="top" src={p.image} />
                            <Card.Body>
                                <Card.Title>{p.name}</Card.Title>
                                <Card.Text>{p.price} VNĐ</Card.Text>
                            </Card.Body>
                        
                            <Card.Body>
                                <Button variant="danger me-2" onClick={() => order(p)}>Đặt hàng</Button>
                                <Button variant="info" onClick={() => nav(`/products/${p.id}`)}>Xem chi tiết</Button>
                            </Card.Body>
                            </Card>
                        </Col>
                </>)}
            </Row>
            {page > 0 && <div className="text-center mb-2">
                <Button variant="success" onClick={loadMore}>Xem thêm...</Button>
            </div>}
            
            {loading && <MySpinner />}
        </>
    );
}

export default Home;