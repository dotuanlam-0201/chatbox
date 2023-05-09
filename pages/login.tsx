import { auth, db } from '@/firebase/config';
import { CHATBOXCONSTANT } from '@/lib/CONTANT';
import { Button, Card, Col, Divider, Form, Input, Row, Spin, Typography, notification } from 'antd';
import { GoogleAuthProvider, getAdditionalUserInfo, signInWithPopup } from "firebase/auth";
import { Timestamp, doc, setDoc } from "firebase/firestore";
import _ from "lodash";
import { useRouter } from 'next/router';
import { useState } from 'react';
import { FcGoogle } from "react-icons/fc";
import { useCookie } from 'react-use';



const LoginComponent = () => {
    const [loading, setLoading] = useState(false as boolean)
    const [form] = Form.useForm();
    const [value, updateCookie, deleteCookie] = useCookie("TOKEN");
    const router = useRouter()

    const onSubmit = () => {
        form.validateFields()
            .then((values: any) => {
                console.log(values);
            })
            .catch((err: any) => {
                return
            })
    }

    const onClickSSOgoole = async () => {
        const provider = new GoogleAuthProvider();
        const response = await signInWithPopup(auth, provider)
        const { user } = response
        if (user) {
            setLoading(true)
            const details = getAdditionalUserInfo(response)
            const { displayName, email, photoURL, uid } = user
            if (details?.isNewUser) {
                const docData = {
                    displayName: displayName,
                    photoURL: photoURL,
                    id: uid,
                    email: email,
                    createAt: Timestamp.fromDate(new Date()).toDate().getTime()
                };
                await setDoc(doc(db, "users", displayName || "user"), docData);
            }
            updateCookie(_.get(user, 'accessToken', null))
            const userInfo = {
                displayName: displayName,
                photoURL: photoURL,
                id: uid,
                email: email
            }
            sessionStorage.setItem("user", JSON.stringify(userInfo))
            sessionStorage.setItem("id", JSON.stringify(uid))
            router.push("/chat")
        } else {
            notification.error({
                message: 'Error',
                description: 'Something went wrong!'
            })
        }
    }

    return (
        <div style={{ width: '100%', height: "100vh", display: 'grid', placeItems: 'center', padding: 10 }}>
            <div style={{ maxWidth: 350, padding: 10, border: `1px solid red` }}>
                <Spin spinning={loading}>
                    <div>
                        <Typography.Title style={{ fontWeight: 900, color: CHATBOXCONSTANT.colors.primaryColorBlue }} level={2}>Welcome back</Typography.Title>
                        <span>Continue width Google or enter your details.</span>
                        <Card
                            onClick={onClickSSOgoole}
                            size='small'
                            bordered
                            hoverable
                            bodyStyle={{
                                textAlign: "center"
                            }}
                        >
                            <span>
                                <FcGoogle />
                                <span>
                                    Log in with Google
                                </span>
                            </span>
                        </Card>
                    </div>

                    <Divider />

                    <Form hideRequiredMark form={form} layout='vertical'>
                        <Row gutter={[10, 10]}>
                            <Col xs={24}>
                                <Form.Item
                                    style={{ marginBottom: 5 }}
                                    name="userName"
                                    rules={[{ required: true, message: 'Required' }]}
                                    label="User Name">
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col xs={24}>
                                <Form.Item
                                    style={{ marginBottom: 5 }}
                                    name="password"
                                    rules={[{ required: true, message: 'Required' }]}
                                    label="Password">
                                    <Input.Password />
                                </Form.Item>
                            </Col>
                            <Col xs={24}>
                                <Button
                                    onClick={onSubmit}>
                                    Login
                                </Button>
                            </Col>
                            <Col>
                                <span className='text-[#b5b5b5] text-[13px] font-normal'>
                                    Don't have an account?
                                    <span>
                                        Sign up here
                                    </span>
                                </span>
                            </Col>
                        </Row>
                    </Form>
                </Spin>
            </div>
        </div>
    )
}

export default LoginComponent
