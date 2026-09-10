import { Form, Input, Button } from 'antd'
import { useState } from 'react'
import { useNavigate } from 'react-router'
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
            <Form form={form} onFinish={onFinish} layout="vertical" style={{padding:'10px'}}>
                <Form.Item name={'email'} rules={[{ required: true }, { type: 'email' }]} label={'E-mail'}>
                    <Input data-testid={'auth-email'} />
                </Form.Item>
                <Form.Item name={'password'} rules={[{ required: true }]} label={'Password'}>
                    <Input.Password data-testid={'auth-password'} />
                </Form.Item>
                <Button htmlType={'submit'} data-testid={'auth-submit'}>{mode === 'register' ? 'Зарегистрироваться' : 'Войти'}</Button>
            </Form>
            {error && <div data-testid={'auth-error'}>{error}</div>}
        </>
    )
}