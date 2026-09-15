import { useState, useEffect } from 'react'
import { Button, Flex } from 'antd';
import { Link } from 'react-router'
import { listPromo } from '../api/promo'
import { PromoItemCard } from '../components/PromoItemCard'
import type { components } from "../types/api";

type PromoBlock = components['schemas']['PromoBlock']

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
                            <PromoItemCard key={promo.id} promo={promo} />
                        ))}
                    </Flex>
                </div>
            )}

        </>
    )
}
