import { Flex, Row, Col, Card, Form, Input, InputNumber, Select, Checkbox, Button, Empty, Space, Tag } from 'antd'
import { listCategories } from '../api/categories'
import { listProducts, type ProductFilters } from '../api/products'
import { useEffect, useState, useRef } from 'react'
import { useSearchParams, Link } from 'react-router'
import type { components } from '../types/api'

type ProductsList = components['schemas']['ProductList'];
type Category = components['schemas']['Category'];

const { Meta } = Card;

const ItemCard = ({ product }: { product: components['schemas']['Product'] }) => {
    if (!product) return;

    return (
        <Card
            data-testid={'catalog-item'}
            hoverable
            variant="borderless"
            style={{ width: 240 }}
            cover={
                <img
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
            <Button disabled={!product.available} color={'primary'} variant={'filled'} style={{ width: '100%' }}>В корзину</Button>
        </Card>
    )
}

export const CatalogPage = () => {

    const [searchParams, setSearchParams] = useSearchParams();
    const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const [productList, setProductList] = useState<ProductsList | null>(null);
    const [categories, setCategories] = useState<Category[]>([])

    const page = Number(searchParams.get('page')) || 1;

    useEffect(() => {
        listCategories().then(setCategories);
    }, [])
    useEffect(() => {
        const controller = new AbortController();

        const filters: ProductFilters = {
            category: searchParams.get('category') ?? undefined,
            search: searchParams.get('search') ?? undefined,
            priceMin: searchParams.get('priceMin') ? Number(searchParams.get('priceMin')) : undefined,
            priceMax: searchParams.get('priceMax') ? Number(searchParams.get('priceMax')) : undefined,
            available: searchParams.get('available') === 'true' ? true : undefined,
            page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
        }

        listProducts(filters, controller.signal).then(setProductList).catch((error) => {
            if (error.name === 'AbortError') return;
            console.error(error);
        })

        return () => controller.abort()
    }, [searchParams]);

    const [form] = Form.useForm();

    const handleValuesChange = (changedValues: Record<string, unknown>, allValues: Record<string, unknown>) => {
        const applyFilters = () => {
            const params = new URLSearchParams(searchParams);
            params.set('page', '1');

            const setOrDelete = (key: string, value: string | undefined) => {
                if (value) params.set(key, value);
                else params.delete(key);
            }

            setOrDelete('category', (allValues.category as string) || undefined)
            setOrDelete('search', (allValues.search as string) || undefined)
            setOrDelete('priceMin', allValues.priceMin ? String(allValues.priceMin) : undefined)
            setOrDelete('priceMax', allValues.priceMax ? String(allValues.priceMax) : undefined)
            setOrDelete('available', allValues.available ? 'true' : undefined)

            setSearchParams(params)
        };

        if ('search' in changedValues) {
            clearTimeout(searchDebounceRef.current);
            searchDebounceRef.current = setTimeout(applyFilters, 300)
        } else {
            applyFilters();
        }
    }

    const goToPage = (page: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', String(page))
        setSearchParams(params);
    }

    const resetForm = () => {
        form.resetFields();
        setSearchParams(new URLSearchParams());
    }

    return (
        <Row style={{ padding: '20px'}} gutter={[20, 20]}>
            <Col xs={24} md={6}>
                <Card data-testid="catalog-filters">
                    <Form
                        form={form}
                        layout="vertical"
                        onValuesChange={handleValuesChange}
                    >
                        <Form.Item name={'category'} label={'Категория'}>
                            <Select
                                data-testid="filter-category"
                                options={[
                                    { value: '', label: 'Все категории' },
                                    ...categories.map(category => ({
                                        value: category.slug,
                                        label: category.name,
                                    }))
                                ]}
                                allowClear
                            />
                        </Form.Item>
                        <Form.Item name={'search'} label={'Название'}>
                            <Input data-testid="filter-search" allowClear />
                        </Form.Item>
                        <Form.Item name={'priceMin'} label={`Цена, от ₽`}>
                            <InputNumber data-testid="filter-price-min" min={0} style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item name={'priceMax'} label={'Цена, до ₽'}>
                            <InputNumber data-testid="filter-price-max" min={0} style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item name={'available'}>
                            <Checkbox data-testid="filter-available">Только в наличии</Checkbox>
                        </Form.Item>
                        <Button data-testid="filter-reset" onClick={() => resetForm()}>Очистить</Button>
                    </Form>
                </Card>
            </Col>
            <Col xs={24} md={18}>
                <Space orientation="vertical" size="medium">
                    <Flex wrap gap={20} justify={productList?.total === 0 ? 'center' : 'space-between'} data-testid="catalog-list">
                        {productList && productList.total > 0 && productList.items.map(product => {
                            return <ItemCard key={product.id} product={product} />
                        })}

                        {productList && productList.total === 0 && (<Empty data-testid="catalog-empty" />)}
                    </Flex>
                    {productList && productList.total > 0 && (
                        <Space data-testid="catalog-pagination">
                            <Button
                                data-testid={'catalog-page-prev'}
                                disabled={page <= 1}
                                onClick={() => goToPage(page - 1)}
                            >
                                Назад
                            </Button>
                            <span>{page} из {Math.ceil(productList.total / productList.pageSize)}</span>
                            <Button
                                data-testid={'catalog-page-next'}
                                disabled={page >= Math.ceil(productList.total / productList.pageSize)}
                                onClick={() => goToPage(page + 1)}
                            >
                                Вперёд
                            </Button>
                        </Space>
                    )}
                </Space>
            </Col>
        </Row>
    )
}