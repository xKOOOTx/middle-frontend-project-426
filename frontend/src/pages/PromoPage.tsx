import { useState, useEffect } from 'react'
import { Button, Flex, Card, Tag } from 'antd';
import { Link } from 'react-router'
import { listPromo } from '../api/promo'
import type { components } from "../types/api";

const { Meta } = Card;

type PromoBlock = components['schemas']['PromoBlock']

const ItemCard = ({ promo }: { promo: PromoBlock }) => {
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

export const PromoPage = () => {
    const [promoList, setPromoList] = useState<PromoBlock[]>([]);

    useEffect(() => {
        listPromo().then(setPromoList)
    }, []);

    return (
        <>
            <div>
                <h1>Комплектующие для ПК с доставкой по городу</h1>
                <p style={{ maxWidth: 700, color: '#9AA0A6', marginBottom: 20 }}>Видеокарты, процессоры и материнские платы в наличии. Собираем подборки под задачу, чтобы не выбирать из всего каталога сразу.</p>
                <Link to={'/catalog'}>
                    <Button variant={'solid'} color={'primary'}>Перейти в каталог</Button>
                </Link>
            </div>
            {promoList.length > 0 && (
                <div style={{ marginTop: 20 }}>
                    <h3>Выбор магазина</h3>
                    <Flex justify={'space-between'} wrap gap={20} data-testid={'home-promo'}>
                        {promoList.map(promo => (
                            <ItemCard key={promo.id} promo={promo} />
                        ))}
                    </Flex>
                </div>
            )}

        </>
    )
}