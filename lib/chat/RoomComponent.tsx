import { Avatar, Badge, Card, Col, Popover, Row } from 'antd'
import { DocumentData } from 'firebase/firestore'
import moment from 'moment'
import { useSessionStorage } from 'react-use'
import { useFirestoreQuerySnapshot } from '../hooks/useFirestoreQuerySnapshot'

interface IRoomComponentProps {
    room: DocumentData
}

const RoomComponent = (props: IRoomComponentProps) => {
    const { name, createAt, avatar } = props.room
    const [id, setid] = useSessionStorage('id', '');
    console.log("🚀 ~ file: RoomComponent.tsx:14 ~ RoomComponent ~ id:", id)


    const { document } = useFirestoreQuerySnapshot({
        collectionName: "users",
        condition: {
            fieldName: "id",
            operator: "==",
            compareValue: id
        }
    })

    const { displayName, photoURL, email } = document

    return (
        <Card hoverable size='small'
            style={{ border: "none", marginBottom: 3 }}
            bodyStyle={{ borderBottom: "1px solid #e8e8e8" }}
        >
            <Row gutter={[10, 10]} justify={"space-between"} align={"middle"}>
                <Col>
                    <Avatar shape="square" size={50} src={avatar} />
                </Col>
                <Col className=' flex-1'>
                    <div className=' font-bold'>
                        {name}
                    </div>
                    <div className=' text-[12px] text-[#797979] font-normal'>
                        Whereas disregard and
                    </div>
                </Col>
                <Col>
                    <div className=' text-[12px] text-[#797979] font-semibold'>
                        <Popover content={<div className='flex items-center gap-2'>
                            <Avatar src={photoURL} />
                            <span className='text-[12px] text-[#797979] font-semibold'>
                                Created by {displayName} 
                                <br/>
                                at {moment(createAt).format("LLLL")}
                            </span>
                        </div>}>
                            {moment(createAt).fromNow()}
                        </Popover>
                    </div>
                    <div className=' float-right'>
                        <Badge count={2} />
                    </div>
                </Col>
            </Row>
        </Card>
    )
}

export default RoomComponent
