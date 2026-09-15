import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router'
import { Row, Col, Card, Empty, Divider, Button } from 'antd'
import { listProducts } from '../api/products'
import { CartItemCard } from '../components/CartItemCard'
import type { components } from '../types/api'

type ProductList = components['schemas']['ProductList'];

export const CartPage = () => {

    const navigate = useNavigate();
    const [products, setProducts] = useState<ProductList | null>(null);
    const { items, setQty, removeItem } = useCart();

    useEffect(() => {
        listProducts({ pageSize: 100 })
            .then(data => {
                setProducts(data);

                const staleIds = items
                    .filter((item) => !data.items.some((product) => product.id === item.productId))
                    .map((item) => item.productId);

                staleIds.forEach((productId) => removeItem(productId));
            })
    }, []);

    const total = products
        ? items.reduce((sum, item) => {
            const product = products.items.find(p => p.id === item.productId);
            return product ? sum + product.price * item.qty : sum;
        }, 0)
        : 0

    return (
        <>
            <h1>Корзина</h1>
            <Row gutter={[16, 16]}>
                <Col span={18}>
                    {items && items.length === 0 && (
                        <Card>
                            <Empty data-testid={'cart-empty'} description={'В корзине пока пусто'} />
                        </Card>
                    )}
                    {items && products && items.length > 0 && items.map((item) => (
                        <CartItemCard key={item.productId} item={item} products={products} setQty={setQty} removeItem={removeItem}/>
                    ))}
                </Col>
                <Col span={6}>
                    <Card styles={{
                        root: { padding: '10px' },
                        body: { padding: 0 }
                    }}>
                        <h3 style={{ margin: 0 }}>Итог</h3>
                        <Divider style={{ margin: '5px 0' }} />
                        <Row justify={'space-between'} align={'middle'}>
                            <Col style={{color: '#888888'}}>Товаров</Col>
                            <Col>{items.length}</Col>
                        </Row>
                        <Row justify={'space-between'} align={'middle'}>
                            <Col style={{color: '#888888'}}>К оплате</Col>
                            <Col>
                                <span data-testid={'cart-total'} style={{ fontSize: 16, fontWeight: "bold"}}>{total.toLocaleString('ru-RU')} ₽</span>
                            </Col>
                        </Row>
                        <Button
                            data-testid={'cart-checkout'}
                            color={'primary'}
                            variant={'solid'}
                            style={{ width: '100%', margin: '20px 0'}}
                            onClick={() => navigate('/checkout')}
                            disabled={items.length === 0}
                        >
                            Оформить заказ
                        </Button>
                        <p style={{ fontSize: 10, color: '#888888' }}>Окончательную сумму посчитает сервер по актуальным ценам.</p>
                    </Card>
                </Col>
            </Row>
        </>
    )
}
