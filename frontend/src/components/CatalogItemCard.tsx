import { Flex, Card, Button, Tag } from 'antd';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Link } from 'react-router'
import { useCart } from '../context/CartContext'
import type { components } from '../types/api'

const { Meta } = Card;

export const CatalogItemCard = ({ product }: { product: components['schemas']['Product'] }) => {
    const { items, addItem, setQty, removeItem } = useCart();
    if (!product) return;

    const cartItem = items.find((item) => item.productId === product.id);
    const handleDecrease = () => {
        if (!cartItem) return;
        if (cartItem.qty <= 1) {
            removeItem(product.id);
        } else {
            setQty(product.id, cartItem.qty - 1);
        }
    }

    return (
        <Card
            data-testid={'catalog-item'}
            hoverable
            variant="borderless"
            style={{ width: 240 }}
            cover={
                <img
                    style={{ minHeight: 240, objectFit: 'cover' }}
                    draggable={false}
                    alt={product.categorySlug}
                    src={product.imageUrl ?? `/${product.categorySlug}.png`}
                />
            }
        >
            <Meta
                title={<Link to={`/products/${product.slug}`} data-testid={'catalog-item-name'}>{product.name}</Link>}
                description={product.description}
            />
            <Flex justify={'space-between'} style={{marginTop: '20px', marginBottom: '20px'}}>
                <span data-testid={'catalog-item-price'}>{product.price.toLocaleString('ru-RU')} ₽</span>
                <Tag data-testid={'catalog-item-availability'} data-available={String(product.available)} color={product.available ? 'green' : 'red'} variant={'solid'}>{product.available ? 'В наличии' : 'Нет в наличии'}</Tag>
            </Flex>
            {cartItem ? (
                <Flex align={'center'} justify={'space-between'}>
                    <Button size={'small'} icon={<MinusOutlined />} onClick={handleDecrease} />
                    <span>{cartItem.qty}</span>
                    <Button size={'small'} icon={<PlusOutlined />} onClick={() => setQty(product.id, cartItem.qty + 1)} />
                </Flex>
            ) : (
                <Button
                    disabled={!product.available}
                    color={'primary'}
                    variant={'filled'}
                    style={{ width: '100%' }}
                    onClick={() => addItem(product.id)}
                >
                    В корзину
                </Button>
            )}
        </Card>
    )
}
