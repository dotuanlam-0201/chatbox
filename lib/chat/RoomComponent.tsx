import { db } from '@/firebase/config'
import { Avatar, Card, Col, Dropdown, Menu, MenuProps, Modal, Popover, Row, Typography, notification } from 'antd'
import { DocumentData, QueryDocumentSnapshot, collection, deleteDoc, deleteField, doc, onSnapshot, query, updateDoc } from 'firebase/firestore'
import _ from "lodash"
import moment from 'moment'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { AiOutlineDelete, AiOutlineEdit, AiOutlineMore } from 'react-icons/ai'
import { useDispatch } from 'react-redux'
import { CHATBOXCONSTANT } from '../CONTANT'
import { toggleVisibleDrawerDiscuss } from '../redux/uiReducer'
import ModalAddEditRoom from './ModalAddEditRoom'
interface IRoomComponentProps {
    room: DocumentData
}

const RoomComponent = (props: IRoomComponentProps) => {
    const { name, avatar, roomId } = props.room
    const router = useRouter()

    const [lastMsgOnSnapShot, setLastMsgOnSnapShot] = useState([] as DocumentData[])
    const dispatch = useDispatch()
    const [selectedRoom, setSelectedRoom] = useState(undefined as undefined | DocumentData)

    const dataLastMessage: {
        [roomId: string]: {
            message?: string
            sendAt?: number
        }
    } = _.head(lastMsgOnSnapShot)

    useEffect(() => {
        const q = query(
            collection(db, "lastMessages"),
        );
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const documents = querySnapshot.docs.map((doc: QueryDocumentSnapshot) => {
                return doc.data()
            })
            setLastMsgOnSnapShot(documents)
        });
        return () => {
            unsubscribe()
        }
    }, [])

    const renderLastMessageTime = () => {
        const twentyFourHoursAgo = moment().subtract(24, "hour");
        if (dataLastMessage && twentyFourHoursAgo.isAfter(moment(dataLastMessage[roomId]?.sendAt))) {
            return moment(dataLastMessage[roomId]?.sendAt).format("ddd, DD-MM")
        } else if (dataLastMessage && twentyFourHoursAgo.isBefore(moment(dataLastMessage[roomId]?.sendAt))) {
            return moment(dataLastMessage[roomId]?.sendAt).format("HH:mm")
        }
    }




    const onSelectRoom = () => {
        router.push(`/chat?roomId=${roomId}`)
        dispatch(toggleVisibleDrawerDiscuss(false))
    }

    return (
        <>
            <Card
                onClick={() => {
                    onSelectRoom()
                }}
                bordered
                hoverable size='small'
                style={{ border: "none", marginBottom: 3, backgroundColor: router.query.roomId === roomId ? "rgb(226 241 255)" : "#fff" }}
                bodyStyle={{ borderBottom: "1px solid #e8e8e8" }}
            >
                <Col>
                    <Row gutter={[10, 10]} justify={"start"}>
                        <Col>
                            <Avatar style={{ border: "1px solid #e8e8e8" }} shape="circle" size={50} src={avatar || ""} />
                        </Col>
                        <Col style={{ width: "calc(100% - 120px)" }}>
                            <Typography.Text style={{ fontWeight: 600 }}>
                                {name}
                            </Typography.Text>
                            <div style={{
                                whiteSpace: "nowrap",
                                maxWidth: "100%",
                                overflow: "hidden",
                                color: CHATBOXCONSTANT.colors.primaryColorGray,
                                textOverflow: "ellipsis"
                            }}>
                                {dataLastMessage && dataLastMessage[roomId]?.message }
                            </div>
                        </Col>
                        <Col style={{ textAlign: "end", flexGrow: 1 }}>
                            <div>
                                <span style={{ color: CHATBOXCONSTANT.colors.primaryColorGray, fontSize: 12 }}>
                                    {dataLastMessage ?
                                        renderLastMessageTime()
                                        : null}
                                </span>
                            </div>
                        </Col>
                    </Row>
                </Col>
            </Card>
        </>
    )
}

export default RoomComponent
