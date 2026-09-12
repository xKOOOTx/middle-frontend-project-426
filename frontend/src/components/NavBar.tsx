import { Flex, Button, Divider, Badge } from 'antd'
import { AppstoreFilled } from '@ant-design/icons'
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router'
import { useCart } from '../context/CartContext'

export const NavBar = () => {

    const { user, logout } = useAuth();
    const { items } = useCart();

    return (
        <>
            <Flex justify="space-between" align={'center'} style={{ padding: '20px 0' }}>
                <Link to={'/'}>
                    <Flex gap={10} align={'center'}>
                        <AppstoreFilled />
                        <h3>Комплектующие</h3>
                    </Flex>
                </Link>
                <Flex justify={'space-between'} align={'center'}>
                    <Link to={'/catalog'} data-testid={'nav-catalog'}>
                        <Button type={'text'}>Каталог</Button>
                    </Link>
                    <Link to={'/cart'} data-testid={'nav-cart'}>
                        <Badge color={'blue'} count={items.length}>
                            <Button>
                                Корзина
                            </Button>
                        </Badge>
                    </Link>
                    {!user && (
                        <>
                            <Link to={'/signin'} data-testid="nav-signin">
                                <Button type={'text'}>Вход</Button>
                            </Link>
                            <Link to={'/signup'} data-testid="nav-signup">
                                <Button variant={'solid'} color={'primary'}>Регистрация</Button>
                            </Link>
                        </>
                    )}
                    {user && (
                        <>
                            <Link to={'/account'} data-testid="nav-account">
                                <Button type={'text'}>Кабинет</Button>
                            </Link>
                            <Button variant={'filled'} color={'danger'} data-testid="nav-signout" onClick={() => logout()}>Выйти</Button>
                        </>
                    )}
                </Flex>
            </Flex>
            <Divider style={{ margin: 0 }} />
        </>
    )
}