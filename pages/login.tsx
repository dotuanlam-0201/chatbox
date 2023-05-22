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
                    createAt: Timestamp.now()
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
        <div style={{
            width: "100%",
            height: "calc(100vh - 20px)",
            display: "grid",
            placeItems: "center",
            padding: 10
        }}>
            <div style={{ maxWidth: 300, padding: 10, border: "1px solid #e8e8e8" }}>
                <Spin spinning={loading}>
                    <div>
                        <Typography.Title style={{ fontWeight: 900, color: CHATBOXCONSTANT.colors.primaryColorBlue }} level={2}>Welcome back</Typography.Title>
                        <Typography.Text>Continue width Google or enter your details.</Typography.Text>
                        <Divider />
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
                                    style={{ width: "100%" }}
                                    type='primary'
                                    onClick={onSubmit}>
                                    Login
                                </Button>
                            </Col>
                            <Col>
                                <Typography.Text
                                    style={{ fontSize: 13, fontWeight: 400, color: CHATBOXCONSTANT.colors.primaryColorGray }}
                                >
                                    Don't have an account?
                                </Typography.Text>
                                <Divider type='vertical' style={{ margin: 5 }} />
                                <Typography.Text style={{ fontWeight: 500 }}>
                                    <a>
                                        Sign up here
                                    </a>
                                </Typography.Text>
                            </Col>
                        </Row>
                    </Form>
                </Spin>
            </div>
        </div >
    )
}

export default LoginComponent
