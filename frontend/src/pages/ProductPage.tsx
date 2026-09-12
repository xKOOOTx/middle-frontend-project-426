import { useParams, Link } from 'react-router';
import { useState, useEffect } from 'react';
import { getProduct } from '../api/products';
import type { components } from '../types/api';
import { Image, Row, Col, Tag, Card, Button, Empty } from 'antd';

export const ProductPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const [product, setProduct] = useState<components['schemas']['Product'] | null>(null);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (!slug) return
        getProduct(slug).then(setProduct).catch(() => setNotFound(true));
    }, [slug]);

    if (notFound) {
        return (
            <Empty description={'Товар не найден'}>
                <Link to={'/'}>
                    <Button variant={'solid'} color={'primary'}>Вернуться на главную</Button>
                </Link>
            </Empty>
        )
    };
    if (!product) return;
    return (
        <>
            <Row justify={'space-between'} align={'top'} gutter={[16, 16]}>
                <Col span={12}>
                    <Image
                        width={'100%'}
                        alt="basic"
                        src={product.imageUrl ? product.imageUrl : `/${product.categorySlug}.png`}
                    />
                </Col>
                <Col span={12}>
                    <h1 style={{marginTop: 0}}>{product.name}</h1>
                    <Tag
                        color={product.available ? 'green' : 'red'}
                        variant={'solid'}
                        style={{ margin: '20px 0' }}
                    >
                        {product.available ? 'В наличии' : 'Нет в наличии'}
                    </Tag>
                    <p>{product.description}</p>
                    <Card style={{margin: '20px 0'}}>
                        <h2>{product.price.toLocaleString('ru-RU')} ₽</h2>
                        <Button disabled={!product.available} color={'primary'} variant={'solid'} style={{width: '100%'}}>В корзину</Button>
                    </Card>
                    <ul>
                        <li>Цена указана в рублях, без копеек</li>
                        <li>Доставка по городу или самовывоз</li>
                        <li>Оплата при оформлении заказа</li>
                    </ul>
                </Col>
            </Row>
        </>
    )
}