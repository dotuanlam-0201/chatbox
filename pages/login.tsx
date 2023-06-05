import { auth, db } from '@/firebase/config';
import { CHATBOXCONSTANT } from '@/lib/CONTANT';
import { Card, Divider, Spin, Typography, notification } from 'antd';
import { FacebookAuthProvider, GoogleAuthProvider, User, getAdditionalUserInfo, signInWithPopup } from "firebase/auth";
import { Timestamp, doc, setDoc } from "firebase/firestore";
import _ from "lodash";
import { useRouter } from 'next/router';
import { useState } from 'react';
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useCookie } from 'react-use';


const LoginComponent = () => {
    const [loading, setLoading] = useState(false as boolean)
    const [value, updateCookie, deleteCookie] = useCookie("TOKEN");
    const router = useRouter()


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

    const onClickSSOFacebook = async () => {
        const provider = new FacebookAuthProvider();
        const response = await signInWithPopup(auth, provider)
        console.log("🚀 ~ file: login.tsx:59 ~ onClickSSOFacebook ~ response:", response)
        const { user } = response
    }

    return (
        <div style={{
            height: "calc(100vh - 20px)",
            display: "grid",
            placeItems: "center",
            padding: 10,
            overflow: "hidden"
        }}>
            <div style={{ maxWidth: 300, padding: 16, border: "1px solid #e8e8e8" }}>
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
                            <span style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 5 }}>
                                <FcGoogle />
                                <span>
                                    Log in with Google
                                </span>
                            </span>
                        </Card>
                        <p />
                        <Card
                            onClick={onClickSSOFacebook}
                            size='small'
                            bordered
                            hoverable
                            bodyStyle={{
                                textAlign: "center"
                            }}
                        >
                            <span style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 5 }}>
                                <FaFacebook style={{ color: "blue" }} />
                                <span>
                                    Log in with Facebook
                                </span>
                            </span>
                        </Card>
                    </div>



                </Spin>
            </div>
        </div >
    )
}

export default LoginComponent
