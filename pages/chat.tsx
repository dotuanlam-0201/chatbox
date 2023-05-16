import { db } from '@/firebase/config'
import { CHATBOXCONSTANT } from '@/lib/CONTANT'
import MessageComponent from '@/lib/chat/MessageComponent'
import RoomsComponent from '@/lib/chat/RoomsComponent'
import { TypeMessage } from '@/lib/chat/model'
import { useFirestoreOnSnapshot } from '@/lib/hooks/useFirestoreOnSnapshot'
import { useFirestoreQuerySnapshot } from '@/lib/hooks/useFirestoreQuerySnapshot'
import DashboardLayout from '@/lib/layout/DashboardLayout'
import { RootState } from '@/lib/redux/store'
import { toggleVisibleMenuDiscuss } from '@/lib/redux/uiReducer'
import { Avatar, Col, Form, Input, Row, Typography } from 'antd'
import { DocumentData, Query, Timestamp, arrayUnion, collection, doc, getDoc, limit, orderBy, query, updateDoc, where } from 'firebase/firestore'
import _ from "lodash"
import moment from 'moment'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import { AiOutlineSend } from 'react-icons/ai'
import { useDispatch, useSelector } from 'react-redux'
import { Scrollbar } from 'react-scrollbars-custom'
import { createBreakpoint } from "react-use"

const useBreakpoint = createBreakpoint();

const ChatBoxComponent = () => {
    const dispatch = useDispatch()
    const breakpoint = useBreakpoint();
    const [visibleSpecificCol, setVisibleSpecificCol] = useState(false as boolean)
    const router = useRouter()
    const [form] = Form.useForm();
    const { displayName, id, photoURL, email } = useSelector((state: RootState) => state.userReducer)
    const messagesEndRef = useRef(null as any)

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

    const dataSource = _.head(messageDataOnSnapShot)?.messages

    const roomQuerySnapShot = useFirestoreQuerySnapshot({
        collectionName: "rooms",
        condition: {
            fieldName: "roomId",
            operator: "==",
            compareValue: `${roomId}`
        }
    })

    const { name, members, avatar } = roomQuerySnapShot

    const membersDataOnSnapData = useFirestoreOnSnapshot({
        query: query(collection(db, "users"),
            where("id", "in", members ? members : [""])
        ) as Query<DocumentData>
    })

    console.log("🚀 ~ file: chat.tsx:65 ~ ChatBoxComponent ~ membersDataOnSnapData:", membersDataOnSnapData)

    useEffect(() => {
        if (breakpoint === 'tablet') {
            dispatch(toggleVisibleMenuDiscuss(true))
            setVisibleSpecificCol(false)
        } else {
            dispatch(toggleVisibleMenuDiscuss(false))
            setVisibleSpecificCol(true)
        }
    }, [breakpoint])

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
                                    align={"middle"}
                                >
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
                                        <Typography.Title style={{ margin: 0, color: "white" }} level={3}>
                                            {name}
                                        </Typography.Title>
                                    </Col>
                                    <Col>
                                        <Avatar.Group maxCount={4}>
                                            {membersDataOnSnapData && membersDataOnSnapData.map((member: DocumentData) => {
                                                const { photoURL } = member
                                                return <Avatar src={photoURL} />
                                            })}
                                        </Avatar.Group>
                                    </Col>
                                </Row>

                            </div>

                            {roomId ?
                                <div style={{ height: "100%", paddingTop: 60 }}>
                                    {dataSource && !_.isEmpty(dataSource) &&
                                        _.keys(dataSource).map((key: string) => {
                                            const messages = dataSource[key]
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
                                <div style={{ height: "100%", textAlign: "center", margin: "20em" }}>
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
                                    <Input onPressEnter={onSendMessage}
                                        suffix={<span onClick={onSendMessage}>
                                            <AiOutlineSend style={{ color: CHATBOXCONSTANT.colors.primaryColorBlue }} />
                                        </span>
                                        }
                                        style={{ width: "100%" }}
                                        placeholder='Message'
                                    />
                                </Form.Item>
                            </Form>
                        </span>
                    </div>
                </Col>
            </Row>

        </DashboardLayout>
    )
}

export default ChatBoxComponent
