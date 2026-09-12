import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext';
import { Row, Col, Card, Empty, Divider, Button, Image, Flex, InputNumber, Tag } from 'antd'
import { listProducts } from '../api/products'
import type { components } from '../types/api'

type ProductList = components['schemas']['ProductList'];

type TItemCard = {
    item: {
        productId: number,
        qty: number
    }
    products: ProductList,
    setQty: (productId: number, qty: number) => void,
    removeItem: (productId: number) => void,
}
const ItemCard = ({item, products, setQty, removeItem}: TItemCard) => {

    const product = products.items.find(prod => prod.id === item.productId )

    if (!product) return;

    return (
        <Card
            data-testid={'cart-item'}
            styles={{
                body: {
                    padding: 10
                }
            }}
        >
            <Flex justify={'space-between'} align={'center'} gap={20}>
                <Image
                    width={150}
                    alt="basic"
                    src={`/${product.categorySlug}.png`}
                />
                <div>
                    <h3>{product.name}</h3>
                    <Tag
                        color={product.available ? 'green' : 'red'}
                        variant={'solid'}
                    >
                        {product.available ? 'В наличии' : 'Нет в наличии'}
                    </Tag>
                    <p style={{ margin: '10px 0' }}>{product.price.toLocaleString('ru-RU')} ₽ за штуку</p>
                </div>
                <InputNumber
                    data-testid={'cart-item-qty'}
                    min={1}
                    defaultValue={item.qty}
                    onChange={(value: number | null) => {
                        if (value !== null) setQty(item.productId, value)
                    }}
                    disabled={!product.available}
                />
                <h3>{product.price * item.qty} ₽</h3>
                <Button data-testid={'cart-item-remove'} variant={'filled'} color={'danger'} onClick={() => removeItem(product.id)}>Удалить</Button>
            </Flex>
        </Card>
    )
}
export const CartPage = () => {

    const [products, setProducts] = useState<ProductList | null>(null)
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
                        <ItemCard key={item.productId} item={item} products={products} setQty={setQty} removeItem={removeItem}/>
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
                            disabled
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