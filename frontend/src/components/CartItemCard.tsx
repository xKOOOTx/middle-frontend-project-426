import { Card, Image, Flex, InputNumber, Tag, Button } from 'antd';
import type { components } from '../types/api';

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

export const CartItemCard = ({ item, products, setQty, removeItem }: TItemCard) => {

    const product = products.items.find(prod => prod.id === item.productId)

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
