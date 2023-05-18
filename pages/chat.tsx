import { db, storage } from '@/firebase/config'
import { CHATBOXCONSTANT } from '@/lib/CONTANT'
import MessageComponent from '@/lib/chat/MessageComponent'
import ModalAddEditRoom from '@/lib/chat/ModalAddEditRoom'
import ModalInviteUser from '@/lib/chat/ModalInviteUser'
import RoomsComponent from '@/lib/chat/RoomsComponent'
import { useFirestoreOnSnapshot } from '@/lib/hooks/useFirestoreOnSnapshot'
import DashboardLayout from '@/lib/layout/DashboardLayout'
import { RootState } from '@/lib/redux/store'
import { toggleVisibleMenuDiscuss } from '@/lib/redux/uiReducer'
import { Avatar, Col, Divider, Dropdown, Form, Input, MenuProps, Modal, Popover, Row, Typography, Upload, message, notification } from 'antd'
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react'
import { DocumentData, Query, Timestamp, arrayRemove, arrayUnion, collection, deleteDoc, deleteField, doc, getDoc, limit, orderBy, query, updateDoc, where } from 'firebase/firestore'
import _ from "lodash"
import moment from 'moment'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import { AiOutlineDelete, AiOutlineEdit, AiOutlineMore, AiOutlineSend, AiOutlineUserAdd } from 'react-icons/ai'
import { useDispatch, useSelector } from 'react-redux'
import { Scrollbar } from 'react-scrollbars-custom'
import { createBreakpoint } from "react-use"
import { BsEmojiSunglasses, BsFillFileEarmarkImageFill } from "react-icons/bs"
import { TiArrowBack } from "react-icons/ti"
import { RcFile } from 'antd/es/upload'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'

const useBreakpoint = createBreakpoint();

const ChatBoxComponent = () => {
    const dispatch = useDispatch()
    const breakpoint = useBreakpoint();
    const [visibleSpecificCol, setVisibleSpecificCol] = useState(false as boolean)
    const router = useRouter()
    const [form] = Form.useForm();
    const { displayName, id, photoURL, email } = useSelector((state: RootState) => state.userReducer)
    const messagesEndRef = useRef(null as any)
    const [visibleModalAddRoom, setVisibleModalAddRoom] = useState(false)
    const [visibleModalInvite, setVisibleModalInvite] = useState(false as boolean)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
    const roomId = router.query.roomId

    const messageDataOnSnapShot = useFirestoreOnSnapshot({
        query: query(collection(db, "messages"),
            where("roomId", "==", `${roomId}`),
            orderBy("createAt", "desc"),
            limit(50)) as Query<DocumentData>
    })

    useEffect(() => {
        scrollToBottom()
    }, [JSON.stringify(messageDataOnSnapShot)]);

    useEffect(() => {
        if (breakpoint === 'tablet') {
            dispatch(toggleVisibleMenuDiscuss(true))
            setVisibleSpecificCol(false)
        } else {
            dispatch(toggleVisibleMenuDiscuss(false))
            setVisibleSpecificCol(true)
        }
    }, [breakpoint])

    const dataMessages = _.head(messageDataOnSnapShot)?.messages

    const roomQuerySnapShot = useFirestoreOnSnapshot({
        query: query(collection(db, "rooms"),
            where("roomId", "==", `${roomId}`)) as Query<DocumentData>
    })

    const { name, members, avatar, createBy } = _.head(roomQuerySnapShot) || {
        name: "",
        members: [""],
        avatar: ""
    }

    const membersOnSnapData = useFirestoreOnSnapshot({
        query: query(collection(db, "users"),
            where("id", "in", members)
        ) as Query<DocumentData>
    })

    const invitationOnSnapData = useFirestoreOnSnapshot({
        query: query(collection(db, "users"),
            where("id", "==", `${id}`)
        ) as Query<DocumentData>
    })

    const dataInvitation = _.head(invitationOnSnapData)

    useEffect(() => {
        if (dataInvitation?.invitation?.roomId && _.isString(dataInvitation?.invitation?.roomId)) {
            const userDocRef = doc(db, "users", `${displayName}`)
            const roomDocRef = doc(db, "rooms", `${dataInvitation.invitation.roomId}`)
            Modal.confirm({
                okText: "Join",
                cancelText: "Reject",
                title: <>Invitation from {dataInvitation.invitation.fromUserName}</>,
                onOk: async () => {
                    await updateDoc(userDocRef, {
                        invitation: deleteField()
                    })
                    await updateDoc(roomDocRef, {
                        members: arrayUnion(id)
                    })
                },
                onCancel: async () => {
                    await updateDoc(userDocRef, {
                        invitation: deleteField()
                    })
                }
            })
        }
    }, [invitationOnSnapData])


    const onSendMessage = () => {
        form.validateFields()
            .then((values: any) => {
                const { message } = values
                if (message) {
                    form.setFieldsValue({
                        message: undefined
                    })
                }
                if (message && roomId) {
                    setData(message)
                }
            })
            .catch((err: any) => {
                console.log(err);
            })
    }

    const setData = async (message: string) => {
        const messageInfo = {
            displayName: displayName,
            id: id,
            photoURL: photoURL,
            email: email,
            message: message,
            sendAt: Timestamp.now()
        }
        const messagesRef = doc(db, "messages", `${roomId}`);
        const messageSnap = await getDoc(messagesRef);

        const lastMessagesRef = doc(db, "lastMessages", "LASTMESSAGES")
        await updateDoc(lastMessagesRef, {
            [`${roomId}`]: {
                message: message,
                sendAt: moment(new Date()).toDate().getTime()
            },
        })

        if (messageSnap.exists()) {
            const docSnapData = messageSnap.data()
            const { messages } = docSnapData
            const twentyFourHoursAgo = moment().subtract(24, "hour");
            let groupTime = ""
            _.keys(messages).forEach((o: string) => {
                if (twentyFourHoursAgo.isBefore(moment(Number(o)))) {
                    groupTime = o
                }
            });
            if (groupTime) {
                await updateDoc(messagesRef, {
                    [`messages.${groupTime}`]: arrayUnion(JSON.stringify(messageInfo)),
                    lastMessage: JSON.stringify(messageInfo)
                })
            } else {
                await updateDoc(messagesRef, {
                    [`messages.${moment(new Date()).toDate().getTime()}`]: [JSON.stringify(messageInfo)],
                    lastMessage: JSON.stringify(messageInfo)
                })
            }
        } else {
            console.log("No such documentOnSnapShot!");
        }
    }

    const items: MenuProps["items"] = [
        {
            key: 'addMemmber',
            danger: false,
            label: 'Add a new member',
            icon: <AiOutlineUserAdd />,
            onClick: (info: any) => {
                setVisibleModalInvite(true)
            }
        },
        {
            key: 'editHeader',
            danger: false,
            label: 'Edit header',
            icon: <AiOutlineEdit />,
            onClick: (info: any) => {
                setVisibleModalAddRoom(true)
            }
        },
        {
            key: 'leaveGroup',
            danger: false,
            label: 'Leave Group',
            icon: <TiArrowBack />,
            onClick: async (info: any) => {
                const roomDocRef = doc(db, "rooms", `${roomId}`)
                router.push(`/chat?roomId=`)
                updateDoc(roomDocRef, {
                    members: arrayRemove(id)
                })
            }
        },
        {
            key: 'deleteRoom',
            disabled: !(createBy === displayName),
            danger: true,
            label: 'Delete',
            icon: <AiOutlineDelete />,
            onClick: (info: any) => {
                Modal.confirm({
                    title: <>Are you sure to delete <strong>{name} ?</strong></>,
                    onOk: async () => {
                        router.push(`/chat?roomId=`)
                        await deleteDoc(doc(db, "rooms", `${roomId}`))
                        await deleteDoc(doc(db, "messages", `${roomId}`))
                        await updateDoc(doc(db, 'lastMessages', 'LASTMESSAGES'), {
                            [`${roomId}`]: deleteField()
                        });
                        notification.success({
                            message: CHATBOXCONSTANT.notification.success.title,
                            description: CHATBOXCONSTANT.notification.success.description.delete
                        })
                    }
                })
            }
        },
    ]

    const beforeUploadImage = async (file: RcFile, FileList: RcFile[]) => {
        const { name, type } = file
        const metadata = {
            contentType: type,
        };
        if (type === "image/png" || type === "image/jpg" || type === "image/jpeg") {
            const storageRef = ref(storage, name);
            await uploadBytes(storageRef, file, metadata);
            const imgURL = await getDownloadURL(storageRef)
            setData(imgURL)
        } else {
            message.warning("Please choose image type PNG | JPG | JPEG")
        }
    }


    return (
        <DashboardLayout
        >
            <Row style={{ height: "100%" }}>

                {visibleSpecificCol &&
                    <Col style={{ borderRight: "1px solid #e8e8e8" }} xs={24} sm={12} md={12} lg={10} xl={8} xxl={8}>
                        <RoomsComponent
                        />
                    </Col>
                }

                <Col style={{ flexGrow: 1 }}>
                    <div style={{ padding: 5 }}>
                        <Scrollbar
                            style={{ height: "calc(100vh - 62px)", overflow: "hidden" }}
                        >
                            {roomId &&
                                <div style={{
                                    padding: 10,
                                    minWidth: 300,
                                    overflow: "hidden",
                                    position: "fixed",
                                    zIndex: 999,
                                    height: 60,
                                    backgroundColor: CHATBOXCONSTANT.colors.primaryColorBlue,
                                    width: "-webkit-fill-available",
                                }}>
                                    <Row
                                        wrap={false}
                                        gutter={[12, 12]}
                                        justify={"space-between"}
                                    >
                                        <Col style={{ alignSelf: "center", cursor: "pointer", color: "white" }}>
                                            <Dropdown trigger={['click']} menu={{ items }} >
                                                <span style={{ fontSize: 20 }}>
                                                    <AiOutlineMore />
                                                </span>
                                            </Dropdown>
                                        </Col>
                                        <Col>
                                            <Avatar
                                                style={{
                                                    boxShadow: "0 3px 10px rgb(0 0 0 / 0.2)",
                                                    border: `1px solid ${CHATBOXCONSTANT.colors.primaryColorBlue}`
                                                }}
                                                size={40}
                                                src={avatar}
                                            />
                                        </Col>
                                        <Col style={{ flexGrow: 1 }}>
                                            <Typography.Title
                                                style={{ margin: 0, color: "white", }} level={3}>
                                                {name}
                                            </Typography.Title>
                                        </Col>
                                        <Col style={{ alignSelf: "center" }}>
                                            <Avatar.Group maxCount={5}>
                                                {membersOnSnapData && membersOnSnapData.map((member: DocumentData) => {
                                                    const { photoURL } = member
                                                    return <Avatar size={"small"} src={photoURL} />
                                                })}
                                            </Avatar.Group>
                                        </Col>
                                    </Row>
                                </div>
                            }


                            {roomId ?
                                <div style={{ height: "100%", paddingTop: 60 }}>
                                    {dataMessages && !_.isEmpty(dataMessages) &&
                                        _.keys(dataMessages).map((key: string) => {
                                            const messages = dataMessages[key]
                                            return <>
                                                <div style={{
                                                    margin: 15, textAlign: "center",
                                                    color: CHATBOXCONSTANT.colors.primaryColorGray,
                                                    whiteSpace: "nowrap"
                                                }}>
                                                    {moment(Number(key)).format("dddd, MMMM Do YYYY")}
                                                </div>
                                                {messages.map((message: string) => {
                                                    return <MessageComponent
                                                        message={message}
                                                    />
                                                })}
                                            </>
                                        })
                                    }
                                </div>
                                :
                                <div style={{ height: "100%", textAlign: "center", marginTop: "30%" }}>
                                    Select a room to start
                                </div>
                            }
                            <div ref={messagesEndRef} />
                        </Scrollbar>
                    </div>

                    <div style={{ padding: 5, width: "100%" }}>
                        <span style={{
                            cursor: "pointer"
                        }}>
                            <Form form={form}>
                                <Form.Item rules={[{
                                    max: 500
                                }]} style={{ marginBottom: 0 }} name={"message"}>
                                    <Input
                                        size='large' onPressEnter={onSendMessage}
                                        suffix={<>
                                            <Popover title="Emoji" content={<>
                                                <EmojiPicker
                                                    onEmojiClick={(emoji: EmojiClickData) => {
                                                        const message = form.getFieldValue("message")
                                                        const messageConcatEmoji = `${message || ""}${emoji.emoji}`
                                                        form.setFieldsValue({
                                                            message: messageConcatEmoji
                                                        })
                                                    }}
                                                    theme={Theme.DARK}
                                                />
                                            </>}>
                                                <span style={{ marginRight: 16 }}>
                                                    <BsEmojiSunglasses />
                                                </span>
                                            </Popover>
                                            <span onClick={onSendMessage}>
                                                <AiOutlineSend style={{ color: CHATBOXCONSTANT.colors.primaryColorBlue }} />
                                            </span>
                                        </>}
                                        prefix={<>
                                            <Upload
                                                beforeUpload={beforeUploadImage}
                                                fileList={[]}
                                                accept='image/png, image/jpeg, image/jpg'
                                            >
                                                <span>
                                                    <BsFillFileEarmarkImageFill />
                                                </span>
                                            </Upload>
                                        </>}
                                        style={{ width: "100%" }}
                                        placeholder='Message'
                                    />
                                </Form.Item>
                            </Form>
                        </span>
                    </div>
                </Col>
            </Row>

            <ModalAddEditRoom
                roomId={roomId}
                initValue={{
                    name: name,
                    avatar: avatar
                }}
                visible={visibleModalAddRoom}
                onClose={() => {
                    setVisibleModalAddRoom(false)
                }}
            />

            <ModalInviteUser
                onClose={() => { setVisibleModalInvite(false) }}
                visible={visibleModalInvite}
            />

        </DashboardLayout>
    )
}

export default ChatBoxComponent
