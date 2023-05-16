import { db } from '@/firebase/config'
import { Avatar, Badge, Card, Col, Row, Typography } from 'antd'
import { DocumentData, QueryDocumentSnapshot, collection, onSnapshot, query } from 'firebase/firestore'
import _ from "lodash"
import moment from 'moment'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useSessionStorage } from 'react-use'
import { CHATBOXCONSTANT } from '../CONTANT'
import { useFirestoreQuerySnapshot } from '../hooks/useFirestoreQuerySnapshot'
import { useDispatch } from 'react-redux'
import { toggleVisibleDrawerDiscuss } from '../redux/uiReducer'
interface IRoomComponentProps {
    room: DocumentData
}

const RoomComponent = (props: IRoomComponentProps) => {
    const { name, avatar, roomId } = props.room
    const router = useRouter()

    const [lastMsgOnSnapShot, setLastMsgOnSnapShot] = useState([] as DocumentData[])
    const dispatch = useDispatch()


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
        if (dataLastMessage && twentyFourHoursAgo.isAfter(moment(dataLastMessage[roomId].sendAt))) {
            return moment(dataLastMessage[roomId].sendAt).format("ddd, DD-MM")
        } else if (dataLastMessage && twentyFourHoursAgo.isBefore(moment(dataLastMessage[roomId].sendAt))) {
            return moment(dataLastMessage[roomId].sendAt).format("HH:mm")
        }
    }

    return (
        <Card
            bordered
            onClick={() => {
                router.push(`/chat?roomId=${roomId}`)
                dispatch(toggleVisibleDrawerDiscuss(false))
            }}
            hoverable size='small'
            style={{ border: "none", marginBottom: 3, backgroundColor: router.query.roomId === roomId ? "rgb(226 241 255)" : "#fff" }}
            bodyStyle={{ borderBottom: "1px solid #e8e8e8" }}
        >
            <Row gutter={[10, 10]} justify={"start"} align={"middle"}>
                <Col>
                    <Avatar style={{ border: "1px solid #e8e8e8" }} shape="circle" size={50} src={avatar || ""} />
                </Col>
                <Col style={{ width: "calc(100% - 100px)" }}>
                    <Typography.Text style={{ fontWeight: 600 }}>
                        {name}
                    </Typography.Text>
                    <div style={{ maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {dataLastMessage && dataLastMessage[roomId].message}
                    </div>
                </Col>
                <Col style={{ textAlign: "end" }}>
                    <div>
                        <span style={{ color: CHATBOXCONSTANT.colors.primaryColorGray, fontSize: 12 }}>
                            {dataLastMessage ?
                                renderLastMessageTime()
                                : null}
                        </span>
                    </div>
                    <div>
                        <Badge count={2} />
                    </div>
                </Col>
            </Row>
        </Card>
    )
}

export default RoomComponent
