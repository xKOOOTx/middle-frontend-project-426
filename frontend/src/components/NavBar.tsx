import { Flex, Button, Breadcrumb, Divider } from 'antd'
import type { BreadcrumbProps } from 'antd'
import { AppstoreFilled } from '@ant-design/icons'
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router'

export const NavBar = () => {

    const { user, logout } = useAuth();

    const styles: BreadcrumbProps['styles'] = {
        item: { color: '#ffffff' },
    };

    const items = [
        {
            title: <Link to={'/'} data-testid={'nav-catalog'}>Каталог</Link>,
        },
    ]

    if (!user) {
        items.push(
            {
                title: <Link to={'/signin'} data-testid="nav-signin">Войти</Link>
            },
            {
                title: <Link to={'/signup'} data-testid="nav-signup">Зарегистрироваться</Link>
            })
    }
    if (user) {
        items.push(
            {
                title: <Link to={'/account'} data-testid="nav-account">Кабинет</Link>
            },
            {
                title: <Button type={'link'} data-testid="nav-signout" onClick={() => logout()}>Выйти</Button>
            })
    }

    return (
        <>
            <Flex justify="space-between" align={'center'} style={{ padding: '20px' }}>
                <Link to={'/'}>
                    <Flex gap={10} align={'center'}>
                        <AppstoreFilled />
                        <h3>Комплектующие</h3>
                    </Flex>
                </Link>
                <Breadcrumb
                    items={items}
                    styles={styles}
                />
            </Flex>
            <Divider />
        </>
    )
}