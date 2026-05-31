import { useContext, useEffect, useState } from "react";
import { Badge, Button, Col, Container, Form, Nav, Navbar, NavDropdown, Row } from "react-bootstrap";
import Apis, { endpoints } from "../configs/Apis";
import { Link, useNavigate } from "react-router-dom";
import { MyCartContext, MyUserContext } from "../configs/Contexts";

const Header = () => {
    const [categories, setCategories] = useState([]);
    const [kw, setKw] = useState();
    const nav = useNavigate();
    const [user, dispatch] = useContext(MyUserContext);
    const [cart, ] = useContext(MyCartContext);

    const loadCates = async () => {
        let res = await Apis.get(endpoints['categories']);
        setCategories(res.data);
    }

    useEffect(() => {
        loadCates();
    }, []);

    const search = (e) => {
        e.preventDefault();

        nav(`/?kw=${kw}`);
    }

    return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand href="#home">eSaleApp</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Link to="/" className="nav-link">Trang chủ</Link>
           
            <NavDropdown title="Danh mục" id="basic-nav-dropdown">
                {categories.map(c => {
                    let url = `/?cateId=${c.id}`;
                    return <Link className="dropdown-item" key={c.id} to={url}>{c.name}</Link>;
                })}
            </NavDropdown>

            {user === null?<>
                <Link to="/register" className="nav-link text-danger">Đăng ký</Link>
                <Link to="/login" className="nav-link text-danger">Đăng nhập</Link>
            </>:<>
                <Link to="/" className="nav-link text-danger">
                    <img src={user.avatar} width={40} className="rounded-circle" /> Chào {user.username}!
                </Link>
                <Button variant="info" onClick={() => dispatch({"type": "LOGOUT"})}>Đăng xuất</Button>
            </>}

            <Link to="/cart" className="nav-link text-success">Giỏ hàng <Badge variant="danger" className="bg-danger">{cart?.totalQuantity || 0}</Badge></Link>
            
          </Nav>
          <Form inline onSubmit={search}>
            <Row>
                <Col xs="auto">
                <Form.Control 
                        placeholder="Tìm sản phẩm"
                        aria-label="Tìm sản phẩm"
                        aria-describedby="basic-addon1"
                        value={kw}
                        onChange={e => setKw(e.target.value)}
                    />
                </Col>
                <Col xs="auto">
                    <Button type="submit" value="success">Tìm</Button>
                </Col>
            </Row>
        </Form>
        </Navbar.Collapse>
      </Container>
    </Navbar>
    );
}

export default Header;