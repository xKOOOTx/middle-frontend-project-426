import { Form, Input, Button, Card, Flex } from 'antd'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { useAuth } from "../context/AuthContext";

type AuthFormProps = {
    mode: 'register' | 'login'
}
export const AuthForm = ({ mode }: AuthFormProps) => {

    const navigate = useNavigate()

    const { login, register } = useAuth();
    const [form] = Form.useForm();
    const [error, setError] = useState<string | null>(null);

    const onFinish = async (values: { email: string; password: string }) => {
        try {
            setError(null);
            if (mode === 'register') {
                await register(values.email, values.password);
            } else {
                await login(values.email, values.password);
            }
            navigate('/');
        } catch (e) {
            setError((e as Error).message)
        }
    }

    return (
        <>
            <Flex justify={'center'} style={{ margin: '20px 0' }}>
                <Card styles={{
                    root: {
                        width: 600,
                    },
                    body: {
                        padding: '20px'
                    }
                }}>
                    <h1 style={{marginTop: 0}}>
                        {mode === 'register' ? 'Регистрация' : 'Вход'}
                    </h1>
                    <p>Аккаунт нужен, чтобы оформить заказ и видеть историю покупок</p>
                    <Form form={form} onFinish={onFinish} layout="vertical" style={{ marginTop: 10 }}>
                        <Form.Item name={'email'} rules={[{ required: true }, { type: 'email' }]} label={'E-mail'}>
                            <Input data-testid={'auth-email'} />
                        </Form.Item>
                        <Form.Item name={'password'} rules={[{ required: true }]} label={'Пароль'}>
                            <Input.Password data-testid={'auth-password'} />
                        </Form.Item>
                        <Button
                            htmlType={'submit'}
                            data-testid={'auth-submit'}
                            variant={'solid'}
                            color={'primary'}
                            style={{ width: '100%' }}
                        >
                            {mode === 'register' ? 'Зарегистрироваться' : 'Войти'}
                        </Button>
                    </Form>
                    <p style={{ marginTop: 10 }}>
                        {mode === 'register' ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}{' '}
                        <Link to={mode === 'register' ? '/signin' : '/signup'}>
                            {mode === 'register' ? 'Войти' : 'Зарегистрироваться'}
                        </Link>
                    </p>
                    {error && <div data-testid={'auth-error'}>{error}</div>}
                </Card>
            </Flex>
        </>
    )
}