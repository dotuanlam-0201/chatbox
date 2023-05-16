import { db } from '@/firebase/config'
import { Button, Divider, Form, Input, Modal, Tooltip } from 'antd'
import { DocumentData, Query, Timestamp, collection, doc, limit, orderBy, query, setDoc, where } from 'firebase/firestore'
import _ from "lodash"
import { useEffect, useState } from 'react'
import { AiOutlineSearch, AiOutlineUsergroupAdd } from 'react-icons/ai'
import { useSelector } from 'react-redux'
import Scrollbar from 'react-scrollbars-custom'
import { useSessionStorage } from 'react-use'
import styled from "styled-components"
import { v4 as uuidv4 } from 'uuid'
import { CHATBOXCONSTANT } from "../CONTANT"
import { useFirestoreOnSnapshot } from '../hooks/useFirestoreOnSnapshot'
import { RootState } from '../redux/store'
import RoomComponent from './RoomComponent'

const RoomsWrapper = styled.div`
    padding: 40px 10px 10px 10px
`

interface IRoomsComponentProps {
}

const RoomsComponent = (props: IRoomsComponentProps) => {
    const [id, setid] = useSessionStorage('id', '');
    const [visibleModalAddRoom, setVisibleModalAddRoom] = useState(false as boolean)
    const [loadingModal, setLoadingModal] = useState(false as boolean)
    const [form] = Form.useForm();
    const { displayName } = useSelector((state: RootState) => state.userReducer)

    const roomsDataOnSnapShot: any = useFirestoreOnSnapshot({
        query: query(collection(db, "rooms"),
            where("members", "array-contains", id),
            orderBy("createAt", "desc"),
            limit(10)) as Query<DocumentData>,
    })

    useEffect(() => {
        if (!visibleModalAddRoom) {
            setLoadingModal(false)
            form.resetFields()
        }
    }, [visibleModalAddRoom])

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
        await setDoc(doc(db, "rooms", roomName), docDataRoom);
        await setDoc(doc(db, "messages", roomId), docDataMessage)
        await setDoc(doc(db, "lastMessages", "LASTMESSAGES"), docDataLastMessage)
        setLoadingModal(false)
        setVisibleModalAddRoom(false)
    }

    const onAddNewRoom = () => {
        form.validateFields()
            .then((values: any) => {
                const { roomName, avatar } = values
                onSetData(roomName, avatar)
            })
            .catch((err: any) => {
                return
            })
    }


    return <RoomsWrapper>
        <div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <Input prefix={<AiOutlineSearch />} placeholder='Search...' />
                <span style={{ fontSize: 20 }} onClick={() => {
                    setVisibleModalAddRoom(true)
                }}>
                    <Tooltip title="Add new room">
                        <AiOutlineUsergroupAdd />
                    </Tooltip>
                </span>
            </div>

            <Divider />

            <Scrollbar style={{ height: "calc(100vh - 150px)", overflow: "hidden", marginTop: 10 }}>
                {
                    roomsDataOnSnapShot && !_.isEmpty(roomsDataOnSnapShot) && roomsDataOnSnapShot.map((room: DocumentData) => {
                        return <RoomComponent
                            room={room}
                        />
                    })

                }
            </Scrollbar>

        </div>
        <Modal
            onCancel={() => {
                setVisibleModalAddRoom(false)
            }}
            style={{ maxWidth: 350 }}
            footer={[
                <Button key="back" onClick={() => setVisibleModalAddRoom(false)}>
                    Cancle
                </Button>,
                <Button style={{ backgroundColor: CHATBOXCONSTANT.colors.primaryColorBlue }} key="submit" type="primary" loading={loadingModal}
                    onClick={() => {
                        onAddNewRoom()
                    }}>
                    Add
                </Button>,
            ]}
            title="Add new room"
            open={visibleModalAddRoom}
        >
            <Form
                form={form}
                hideRequiredMark
                layout='vertical'>
                <Form.Item
                    name={"roomName"}
                    rules={[{
                        required: true,
                        message: "Required"
                    }]} label='Room name'>
                    <Input placeholder="Name" />
                </Form.Item>
                <Form.Item
                    name={"avatar"}
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
    </RoomsWrapper >
}

export default RoomsComponent


