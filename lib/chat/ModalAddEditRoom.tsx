import { Button, Form, Input, Modal } from 'antd'
import React, { useEffect, useState } from 'react'
import { CHATBOXCONSTANT } from '../CONTANT'
import { DocumentData, Timestamp, doc, setDoc, updateDoc } from 'firebase/firestore'
import { useSelector } from 'react-redux'
import { RootState } from '../redux/store'
import { useSessionStorage } from 'react-use'
import { db } from '@/firebase/config'
import { v4 as uuidv4 } from 'uuid'

interface IModalAddEditRoomProps {
    visible: boolean
    onClose: () => void
    initValue?: {
        name: string,
        avatar: string
    }
    roomId?: any 
}


const ModalAddEditRoom = (props: IModalAddEditRoomProps) => {
    const { onClose, visible, initValue } = props
    const [id, setid] = useSessionStorage('id', '');
    const [loadingModal, setLoadingModal] = useState(false as boolean)
    const [form] = Form.useForm();
    const { displayName } = useSelector((state: RootState) => state.userReducer)

    useEffect(() => {
        form.resetFields()
    }, [visible])


    const onAddNewRoom = () => {
        form.validateFields()
            .then((values: any) => {
                const { roomName, avatar } = values
                if (props.initValue) {
                    onUpdateData(roomName, avatar)
                } else {
                    onSetData(roomName, avatar)
                }
            })
            .catch((err: any) => {
                return
            })
    }

    const onSetData = async (roomName: string, avatar: string) => {
        const roomId = uuidv4()
        setLoadingModal(true)
        const docDataRoom = {
            roomId: roomId,
            avatar: avatar,
            createAt: Timestamp.now(),
            createBy: displayName,
            name: roomName,
            members: [id]
        }
        const docDataMessage = {
            roomId: roomId,
            messages: [],
            createAt: Timestamp.now(),
        }
        let docDataLastMessage: any = {
            createAt: Timestamp.now(),
        }
        docDataLastMessage[roomId] = ""
        await setDoc(doc(db, "rooms", roomId), docDataRoom)
        await setDoc(doc(db, "messages", roomId), docDataMessage)
        await updateDoc(doc(db, "lastMessages", "LASTMESSAGES"), docDataLastMessage)
        setLoadingModal(false)
        onClose()
    }

    const onUpdateData = async (roomName: string, avatar: string) => {
        await updateDoc(doc(db, "rooms", props?.roomId || ""), {
            avatar: avatar,
            name: roomName
        })
        onClose()
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
                        onAddNewRoom()
                    }}>
                    {initValue ? "Update" : "Add"}
                </Button>,
            ]}
            title="Add new room"
            open={visible}
        >
            <Form
                hideRequiredMark
                form={form}
                layout='vertical'>
                <Form.Item
                    initialValue={props?.initValue?.name}
                    name={"roomName"}
                    rules={[{
                        required: true,
                        message: "Required"
                    }]} label='Room name'>
                    <Input maxLength={40} placeholder="Name" />
                </Form.Item>
                <Form.Item
                    name={"avatar"}
                    initialValue={props?.initValue?.avatar}
                    rules={[{
                        required: true,
                        message: "Required"
                    }, {
                        validator: (rule, value, callback) => {
                            var img = new Image();
                            img.src = value;
                            img.onload = function () {
                                callback();
                            };
                            img.onerror = function () {
                                callback("Invalid Image URL")
                            };
                        }
                    }]}
                    label='Avatar'
                >
                    <Input placeholder="URL" />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default ModalAddEditRoom


