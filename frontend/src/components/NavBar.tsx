import { Flex, Button, Breadcrumb } from 'antd'
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
            title: <Link to={'/'}>Каталог</Link>,
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
        <Flex justify="space-between" align={'center'} style={{ padding: '20px' }}>
            <Flex gap={10} align={'center'}>
                <AppstoreFilled />
                Комплектующие
            </Flex>
            <Breadcrumb
                items={items}
                styles={styles}
            />
        </Flex>
    )
}