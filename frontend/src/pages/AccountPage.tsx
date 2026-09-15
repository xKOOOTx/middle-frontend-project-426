import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Card, Empty } from 'antd';
import { listOrders } from '../api/orders';
import { useAuth } from '../context/AuthContext';
import { OrderCard } from '../components/OrderCard';
import type { components } from '../types/api';

type Order = components['schemas']['Order'];

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
