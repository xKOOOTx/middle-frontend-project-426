import { Flex, Card, Tag } from 'antd';
import { Link } from 'react-router'
import type { components } from '../types/api'

const { Meta } = Card;

type PromoBlock = components['schemas']['PromoBlock']

export const PromoItemCard = ({ promo }: { promo: PromoBlock }) => {
    return (
        <Link to={`/products/${promo.product.slug}`} data-testid={'home-promo-item'}>
            <Card
                hoverable
                variant="borderless"
                style={{ width: 320 }}
                cover={
                    <img
                        style={{ minHeight: 240, objectFit: 'cover' }}
                        draggable={false}
                        alt={promo.product.categorySlug}
                        src={`/${promo.product.categorySlug}.png`}
                    />
                }
            >
                <Meta
                    title={promo.title}
                    description={promo.text}
                />
                <Flex justify={'space-between'} style={{marginTop: '20px', marginBottom: '20px'}}>
                    <span>{promo.product.price.toLocaleString('ru-RU')} ₽</span>
                    <Tag color={'blue'} variant={'solid'}>{promo.product.name}</Tag>
                </Flex>
            </Card>
        </Link>
    )
}
