import { Flex, Row, Col, Card, Form, Input, InputNumber, Checkbox, Button, Space, Pagination } from 'antd'
import { listCategories } from '../api/categories'
import { listProducts, type ProductFilters } from '../api/products'
import { useEffect, useState, useRef, cloneElement, isValidElement } from 'react'
import type { ReactElement } from 'react'
import { useSearchParams } from 'react-router'
import type { components } from '../types/api'
import { CatalogItemCard } from '../components/CatalogItemCard'

type ProductsList = components['schemas']['ProductList'];
type Category = components['schemas']['Category'];

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

    useEffect(() => {
        form.setFieldsValue({
            category: searchParams.get('category') ?? '',
            search: searchParams.get('search') ?? '',
            priceMin: searchParams.get('priceMin') ? Number(searchParams.get('priceMin')) : undefined,
            priceMax: searchParams.get('priceMax') ? Number(searchParams.get('priceMax')) : undefined,
            available: searchParams.get('available') === 'true',
        })
    }, [searchParams, form]);

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
        <>
        <h1>Комплектующие для ПК</h1>
        <p style={{ color: '#888888', marginBottom: 20 }}>
            Видеокарты, процессоры и материнские платы — с фильтрами по категории, цене и наличию.
        </p>
        <Row gutter={[20, 20]}>
            <Col xs={24} md={6}>
                <Card data-testid="catalog-filters">
                    <Form
                        form={form}
                        layout="vertical"
                        onValuesChange={handleValuesChange}
                    >
                        <Form.Item name={'category'} label={'Категория'}>
                            <select
                                data-testid="filter-category"
                                style={{ width: '100%', height: 32, padding: '4px 11px', borderRadius: 6, border: '1px solid #d9d9d9', fontSize: 14 }}
                            >
                                <option value={''}>Все категории</option>
                                {categories.map(category => (
                                    <option key={category.slug} value={category.slug}>{category.name}</option>
                                ))}
                            </select>
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
                        <Form.Item name={'available'} valuePropName={'checked'}>
                            <Checkbox data-testid="filter-available">Только в наличии</Checkbox>
                        </Form.Item>
                        <Button data-testid="filter-reset" style={{ width: '100%' }} onClick={() => resetForm()}>
                            Сбросить фильтры
                        </Button>
                    </Form>
                </Card>
            </Col>
            <Col xs={24} md={18}>
                <Space orientation="vertical" size="medium" style={{ width: '100%' }}>
                    <p style={{ color: '#888888', margin: 0 }}>Найдено товаров: {productList?.total ?? 0}</p>
                    <Flex wrap gap={20} justify={productList?.total === 0 ? 'center' : 'space-between'} data-testid="catalog-list">
                        {productList && productList.total > 0 && productList.items.map(product => {
                            return <CatalogItemCard key={product.id} product={product} />
                        })}

                        {productList && productList.total === 0 && (
                            <Card data-testid="catalog-empty" style={{ width: '100%', textAlign: 'center', padding: '20px 0' }}>
                                <h3>Ничего не найдено</h3>
                                <p style={{ color: '#888888' }}>
                                    Под выбранные фильтры не подошёл ни один товар. Измените условия или сбросьте фильтры.
                                </p>
                                <Button
                                    color={'primary'}
                                    onClick={resetForm}
                                    variant={'filled'}
                                    style={{ marginTop: 10 }}
                                >
                                    Показать все товары
                                </Button>
                            </Card>
                        )}
                    </Flex>
                    {productList && productList.total > 0 && (
                        <Flex vertical align={'center'} gap={6} data-testid="catalog-pagination">
                            <Pagination
                                current={page}
                                total={productList.total}
                                pageSize={productList.pageSize}
                                onChange={(nextPage) => goToPage(nextPage)}
                                showSizeChanger={false}
                                itemRender={(_pageNumber, type, originalElement) => {
                                    if (type === 'prev' && isValidElement(originalElement)) {
                                        return cloneElement(originalElement as ReactElement<Record<string, unknown>>, { 'data-testid': 'catalog-page-prev' });
                                    }
                                    if (type === 'next' && isValidElement(originalElement)) {
                                        return cloneElement(originalElement as ReactElement<Record<string, unknown>>, { 'data-testid': 'catalog-page-next' });
                                    }
                                    return originalElement;
                                }}
                            />
                        </Flex>
                    )}
                </Space>
            </Col>
        </Row>
        </>
    )
}