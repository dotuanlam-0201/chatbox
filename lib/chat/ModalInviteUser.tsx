import { db } from '@/firebase/config'
import emailjs from "@emailjs/browser"
import { Alert, Button, Form, Input, Modal, Tooltip, notification } from 'antd'
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { AiOutlineSend } from 'react-icons/ai'
import { useSelector } from 'react-redux'
import { CHATBOXCONSTANT } from '../CONTANT'
import { RootState } from '../redux/store'

interface IModalInviteUserProps {
    onClose: () => void
    visible: boolean
}

const ModalInviteUser = (props: IModalInviteUserProps) => {
    const { onClose, visible } = props
    const [loadingModal, setLoadingModal] = useState(false as boolean)
    const [visibleUserNotExist, setVisibleUserNotExist] = useState(false as boolean)
    const { displayName } = useSelector((state: RootState) => state.userReducer)
    const [loadingSendEmail, setLoadingSendEmail] = useState(false as boolean)

    const [form] = Form.useForm();
    const email = form.getFieldValue("email")
    const router = useRouter()
    const roomId = router.query.roomId

    useEffect(() => {
        setVisibleUserNotExist(false)
        setLoadingSendEmail(false)
        form.resetFields()
    }, [visible])

    const onInvite = () => {
        setLoadingModal(true)
        form.validateFields()
            .then(async (values) => {
                setLoadingModal(false)
                const { email } = values
                const q = query(collection(db, "users"), where("email", "==", email),);
                const querySnapshot = await getDocs(q);
                if (querySnapshot.empty) {
                    setVisibleUserNotExist(true)
                } else {
                    querySnapshot.forEach((doc) => {
                        if (doc.id) {
                            updateInvitation(doc.id)
                            notification.success({
                                message: CHATBOXCONSTANT.notification.success.title,
                                description: <>Invited {doc.id} ({email})</>
                            })
                            onClose()
                        }
                    });
                }

            })
            .catch((err) => {
                setLoadingModal(false)
                return
            })
    }

    const updateInvitation = async (id: string) => {
        const docRef = doc(db, "users", id)
        await updateDoc(docRef, {
            invitation: {
                roomId: roomId,
                fromUserName: displayName,
            }
        })
    }

    const onSendEmail = async () => {
        setLoadingSendEmail(true)
        var templateParams = {
            toEmail: email,
            fromName: displayName,
            message: "Join Boxchat to have interesting experiences together!",
            url: "https://dev--peaceful-smakager-75f31d.netlify.app/login"
        };
        const reponse = await emailjs.send('service_lhppvpb', "template_invite_user", templateParams, "SnC1lB6gyDZXaifeT")
        if (reponse.status === 200) {
            notification.success({
                message: CHATBOXCONSTANT.notification.success.title,
                description: "Sent successfully"
            })
            setLoadingSendEmail(false)
        } else {
            notification.success({
                message: CHATBOXCONSTANT.notification.error.title,
                description: CHATBOXCONSTANT.notification.error.description
            })
            setLoadingSendEmail(false)
        }
    }

    return (
        <Modal
            onCancel={onClose}
            style={{ maxWidth: 350 }}
            footer={[
                <Button key="back" onClick={onClose}>
                    Cancle
                </Button>,
                <Button style={{ backgroundColor: CHATBOXCONSTANT.colors.primaryColorBlue }}
                    key="submit" type="primary" loading={loadingModal}
                    onClick={() => {
                        onInvite()
                    }}>
                    Invite
                </Button>,
            ]}
            title="Add new user"
            open={visible}
        >
            <Form
                hideRequiredMark
                form={form}
                layout='vertical'>
                <Form.Item
                    name={"email"}
                    rules={[{
                        required: true,
                        message: "Required"
                    }, {
                        type: "email"
                    }]} label='Email'>
                    <Input placeholder="Email" />
                </Form.Item>
                {visibleUserNotExist &&
                    <Alert type="warning" message={<div >
                        {email} has not registered to use chatbox. Send them an invitation to join the chatbox?
                        <Tooltip title="Send email">
                            <Button
                                loading={loadingSendEmail}
                                onClick={onSendEmail}
                                style={{ verticalAlign: "text-top" }}
                                type='link' size='small' icon={<AiOutlineSend />} />
                        </Tooltip>
                    </div>} />
                }
            </Form>
        </Modal>
    )
}

export default ModalInviteUser
