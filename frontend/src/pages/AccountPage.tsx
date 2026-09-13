import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Card, Tag, Divider, Flex, Row, Col, Empty } from 'antd';
import { listOrders } from '../api/orders';
import { useAuth } from '../context/AuthContext';
import type { components } from '../types/api';

type Order = components['schemas']['Order'];

const formatOrderDate = (value: string) =>
    new Date(value).toLocaleString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

const OrderCard = ({ order }: { order: Order }) => (
    <Card data-testid={'account-order-item'} style={{ marginBottom: 16 }}>
        <Flex justify={'space-between'} align={'center'} style={{ marginBottom: 16 }}>
            <Flex align={'center'} gap={12}>
                <h3 style={{ margin: 0 }}>Заказ №{order.id}</h3>
                <Tag data-testid={'order-status'} data-status={order.status} color={'green'} variant={'solid'}>
                    Оплачен
                </Tag>
            </Flex>
            <span style={{ color: '#888888' }}>{formatOrderDate(order.createdAt)}</span>
        </Flex>

        <Row style={{ color: '#888888', borderBottom: '1px solid #f0f0f0', paddingBottom: 8, marginBottom: 8 }}>
            <Col span={10}>Товар</Col>
            <Col span={4} style={{ textAlign: 'center' }}>Кол-во</Col>
            <Col span={5} style={{ textAlign: 'right' }}>Цена покупки</Col>
            <Col span={5} style={{ textAlign: 'right' }}>Сумма</Col>
        </Row>
        {order.items.map((item, index) => (
            <Row key={item.productId ?? index} style={{ padding: '6px 0' }}>
                <Col span={10}>{item.name}</Col>
                <Col span={4} style={{ textAlign: 'center' }}>{item.qty}</Col>
                <Col span={5} style={{ textAlign: 'right' }}>{item.price.toLocaleString('ru-RU')} ₽</Col>
                <Col span={5} style={{ textAlign: 'right' }}>{(item.price * item.qty).toLocaleString('ru-RU')} ₽</Col>
            </Row>
        ))}

        <Divider style={{ margin: '12px 0' }} />

        <Flex justify={'space-between'} align={'center'}>
            <span style={{ color: '#888888' }}>
                {order.method === 'delivery'
                    ? `Доставка: ${order.address}, ${order.recipientName}, ${order.phone}`
                    : `Самовывоз: ${order.recipientName}, ${order.phone}`}
            </span>
            <h3 style={{ margin: 0 }}>
                Итого: <span data-testid={'order-total'}>{order.total.toLocaleString('ru-RU')} ₽</span>
            </h3>
        </Flex>
    </Card>
);

export const AccountPage = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[] | null>(null);

    useEffect(() => {
        listOrders().then(setOrders);
    }, []);

    if (!orders) return null;

    return (
        <>
            <h1 style={{ marginBottom: 10 }}>Личный кабинет</h1>
            {user && <p style={{ color: '#888888', marginBottom: 10 }}>{user.email}</p>}

            {orders.length === 0 && (
                <Card>
                    <Empty data-testid={'account-orders-empty'} description={'Заказов пока нет'} />
                </Card>
            )}

            {orders.length > 0 && (
                <div data-testid={'account-orders'}>
                    {orders.map((order) => (
                        <OrderCard key={order.id} order={order} />
                    ))}
                </div>
            )}

            <Link to={'/catalog'} style={{ color: '#9AA0A6' }}>Продолжить покупки</Link>
        </>
    );
};
