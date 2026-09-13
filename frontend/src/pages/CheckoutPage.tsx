import { useEffect, useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router';
import { Form, Input, Select, Button, Alert, Card, Row, Col, Tag, Avatar, Flex, Divider } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { useCart } from '../context/CartContext';
import { createOrder, OrderApiError } from '../api/orders';
import { listProducts } from '../api/products';
import type { components } from '../types/api';

type Order = components['schemas']['Order'];
type ProductList = components['schemas']['ProductList'];
type OrderItemCheck = { productId: number; valid: boolean; reason?: 'not_found' | 'unavailable' };

const formatOrderDate = (value: string) =>
    new Date(value).toLocaleString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

export const CheckoutPage = () => {
    const navigate = useNavigate();
    const { items, clearCart } = useCart();
    const [form] = Form.useForm();
    const [products, setProducts] = useState<ProductList | null>(null);
    const [order, setOrder] = useState<Order | null>(null);
    const [error, setError] = useState<OrderApiError | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const method = Form.useWatch('method', form);

    useEffect(() => {
        listProducts({ pageSize: 100 }).then(setProducts);
    }, []);

    if (items.length === 0 && !order) {
        return <Navigate to={'/cart'} replace />;
    }

    const resolveName = (productId: number) =>
        products?.items.find((p) => p.id === productId)?.name ?? `Товар #${productId}`;

    const summaryItems = items.map((item) => ({
        ...item,
        product: products?.items.find((p) => p.id === item.productId),
    }));
    const preliminaryTotal = summaryItems.reduce(
        (sum, item) => sum + (item.product ? item.product.price * item.qty : 0),
        0,
    );

    const onFinish = async (values: { method: 'delivery' | 'pickup'; recipientName: string; phone: string; address?: string }) => {
        setSubmitting(true);
        setError(null);

        try {
            const created = await createOrder({
                items: items.map((item) => ({ productId: item.productId, qty: item.qty })),
                method: values.method,
                recipientName: values.recipientName,
                phone: values.phone,
                address: values.method === 'delivery' ? values.address : undefined,
            });

            setOrder(created);
            clearCart();
        } catch (e) {
            if (e instanceof OrderApiError) {
                setError(e);
            } else {
                setError(new OrderApiError({ code: 'UNKNOWN', message: 'Не удалось оформить заказ' }));
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (order) {
        return (
            <div data-testid={'order-success'}>
                <Card style={{ background: '#f0fbf6', border: '1px solid #b7ebd3', marginBottom: 20 }}>
                    <Flex align={'center'} gap={16}>
                        <Avatar icon={<CheckOutlined />} size={40} style={{ background: '#0f9d76', flexShrink: 0 }} />
                        <div>
                            <h2 style={{ margin: 0 }}>Заказ №{order.id} оформлен</h2>
                            <p style={{ margin: 0, color: '#888888' }}>
                                {formatOrderDate(order.createdAt)}
                                {' · '}
                                {order.method === 'delivery' ? `доставка на адрес ${order.address}` : 'самовывоз'}
                            </p>
                        </div>
                    </Flex>
                </Card>
                <Row gutter={[20, 20]}>
                    <Col xs={24} md={14}>
                        <Card>
                            <Flex justify={'space-between'} align={'center'} style={{ marginBottom: 10 }}>
                                <h3 style={{ margin: 0 }}>Состав заказа</h3>
                                <Tag data-testid={'order-status'} data-status={order.status} color={'green'} variant={'solid'}>
                                    Оплачен
                                </Tag>
                            </Flex>
                            <Divider style={{ margin: '10px 0' }} />
                            {order.items.map((item, index) => (
                                <Flex key={item.productId ?? index} justify={'space-between'} style={{ marginBottom: 8 }}>
                                    <span>{item.name} × {item.qty}</span>
                                    <span>{(item.price * item.qty).toLocaleString('ru-RU')} ₽</span>
                                </Flex>
                            ))}
                        </Card>
                    </Col>
                    <Col xs={24} md={10}>
                        <Card>
                            <Flex justify={'space-between'} align={'center'}>
                                <span>Итого</span>
                                <h3 style={{ margin: 0 }} data-testid={'order-total'}>{order.total.toLocaleString('ru-RU')} ₽</h3>
                            </Flex>
                            <p style={{ color: '#888888', marginTop: 10 }}>
                                Получатель: {order.recipientName}, {order.phone}
                            </p>
                            <Button
                                color={'primary'}
                                variant={'solid'}
                                style={{ width: '100%', marginBottom: 10, marginTop: 10 }}
                                onClick={() => navigate('/account')}
                            >
                                Мои заказы
                            </Button>
                            <Flex justify={'center'}>
                                <Link to={'/catalog'}>Вернуться в каталог</Link>
                            </Flex>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }

    const invalidItems = (error?.details?.items as OrderItemCheck[] | undefined)?.filter((i) => !i.valid) ?? [];

    return (
        <>
            <h1>Оформление заказа</h1>
            {error && (
                <Alert
                    data-testid={'order-error'}
                    type={'error'}
                    message={error.message}
                    description={
                        invalidItems.length > 0 && (
                            <ul>
                                {invalidItems.map((item) => (
                                    <li key={item.productId}>
                                        {resolveName(item.productId)} — {item.reason === 'not_found' ? 'товар не найден' : 'нет в наличии'}
                                    </li>
                                ))}
                            </ul>
                        )
                    }
                    style={{ marginBottom: 20 }}
                />
            )}
            <Row gutter={[20, 20]}>
                <Col xs={24} md={14}>
                    <Card title={'Получение'}>
                        <Form
                            form={form}
                            data-testid={'checkout-form'}
                            layout={'vertical'}
                            onFinish={onFinish}
                            initialValues={{ method: 'pickup' }}
                        >
                            <Form.Item name={'method'} label={'Способ получения'}>
                                <Select
                                    data-testid={'checkout-method'}
                                    options={[
                                        { value: 'delivery', label: 'Доставка' },
                                        { value: 'pickup', label: 'Самовывоз' },
                                    ]}
                                />
                            </Form.Item>
                            <Form.Item name={'recipientName'} label={'Имя получателя'} rules={[{ required: true }]}>
                                <Input data-testid={'checkout-name'} />
                            </Form.Item>
                            <Form.Item name={'phone'} label={'Телефон'} rules={[{ required: true }]}>
                                <Input data-testid={'checkout-phone'} />
                            </Form.Item>
                            {method === 'delivery' && (
                                <Form.Item name={'address'} label={'Адрес доставки'} rules={[{ required: true }]}>
                                    <Input data-testid={'checkout-address'} />
                                </Form.Item>
                            )}
                            <Button
                                htmlType={'submit'}
                                data-testid={'checkout-submit'}
                                loading={submitting}
                                color={'primary'}
                                variant={'solid'}
                                style={{ width: '100%' }}
                            >
                                Оформить заказ
                            </Button>
                        </Form>
                    </Card>
                </Col>
                <Col xs={24} md={10}>
                    <Card title={'Состав заказа'}>
                        {summaryItems.map((item) => (
                            <Flex key={item.productId} justify={'space-between'} style={{ marginBottom: 8 }}>
                                <span>{item.product?.name ?? `Товар #${item.productId}`} × {item.qty}</span>
                                <span>{item.product ? (item.product.price * item.qty).toLocaleString('ru-RU') : '—'} ₽</span>
                            </Flex>
                        ))}
                        <Divider style={{ margin: '10px 0' }} />
                        <Flex justify={'space-between'} align={'center'}>
                            <span style={{ color: '#888888' }}>Предварительный итог</span>
                            <h3 style={{ margin: 0 }}>{preliminaryTotal.toLocaleString('ru-RU')} ₽</h3>
                        </Flex>
                        <p style={{ fontSize: 12, color: '#888888', marginTop: 10, marginBottom: 0 }}>
                            Окончательную сумму посчитает сервер по актуальным ценам.
                        </p>
                    </Card>
                </Col>
            </Row>
        </>
    );
};
