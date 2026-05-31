import { useContext, useEffect, useState } from "react";
import { Button, Col, Form, Image, ListGroup, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import moment from "moment";
import 'moment/locale/vi';
import { MyUserContext } from "../../configs/Contexts";

const ProductDetails = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [comments, setComments] = useState([]);
    const [user, ] = useContext(MyUserContext);
    const nav = useNavigate();
    const [comment, setComment] = useState();

    const loadProduct = async () => {
        let res = await Apis.get(endpoints['product-details'](productId));
        setProduct(res.data);
    }

    const loadComments = async () => {
        let res = await Apis.get(endpoints['comments'](productId));
        setComments(res.data);
    }
    
    const addComment = async () => {
        let res = await authApis().post(endpoints['addComment'](productId), {
            'content': comment
        });
        if (res.status === 201) {
            setComments([res.data, ...comments]);
            setComment("");
        }
    }

    useEffect(() => {
        loadProduct();
        loadComments();
    }, [productId]);

    return (
        <>
            <h1 className="text-center text-success mt-1">CHI TIET SAN PHAM ({productId})</h1>

            {product && <Row>
                            <Col md={4} xs={12}>
                                {product.image && <Image src={product.image} fluid rounded />}
                            </Col>
                            <Col md={8} xs={12}>
                                <h2>{product.name}</h2>
                                <h3 className="text-danger">{product.price.toLocaleString()} VND</h3>
                            </Col>
                        </Row>}

            {user === null? <>
                <p>Vui long <Button variant="warning" onClick={() => nav(`/login?next=/products/${product.id}`)}>dang nhap</Button> de binh luan!</p>
            </>:<>
                <div className="mt-1 mb-1">
                    <Form.Control placeholder="Noi dung binh luan..." value={comment} onChange={e => setComment(e.target.value)} />
                    <Button onClick={addComment} variant="success" className="mt-1">Binh luan</Button>
                </div>
            </>}

            <ListGroup>
                {comments.map(c => <ListGroup.Item key={c.id}>
                                        <Row>
                                            <Col md={1} xs={6}>
                                                <Image src={c.userId.avatar} fluid roundedCircle />
                                            </Col>
                                            <Col md={11} xs={6}>
                                                <p>{c.content}</p>
                                                <p><em>{moment(c.createdDate).fromNow()}</em></p>
                                            </Col>
                                        </Row>
                                    </ListGroup.Item>)}
            </ListGroup>
        </>
    );
}

export default ProductDetails;