import { db } from '@/firebase/config'
import { Button, Divider, Input } from 'antd'
import { DocumentData, Query, collection, limit, orderBy, query, where } from 'firebase/firestore'
import _ from "lodash"
import { useState } from 'react'
import { AiOutlineSearch } from 'react-icons/ai'
import Scrollbar from 'react-scrollbars-custom'
import { useSessionStorage } from 'react-use'
import styled from "styled-components"
import { useFirestoreOnSnapshot } from '../hooks/useFirestoreOnSnapshot'
import ModalAddEditRoom from './ModalAddEditRoom'
import RoomComponent from './RoomComponent'

const RoomsWrapper = styled.div`
    padding: 40px 10px 10px 10px
`

interface IRoomsComponentProps {
}

const RoomsComponent = (props: IRoomsComponentProps) => {
    const [id, setid] = useSessionStorage('id', '');
    const [visibleModalAddRoom, setVisibleModalAddRoom] = useState(false as boolean)

    const roomsDataOnSnapShot: any = useFirestoreOnSnapshot({
        query: query(collection(db, "rooms"),
            where("members", "array-contains", id),
            orderBy("createAt", "desc"),
            limit(10)) as Query<DocumentData>,
    })


    return <RoomsWrapper>
        <div>

            <div style={{ display: "flex", gap: 10 }}>
                <Input prefix={<AiOutlineSearch />} placeholder='Search...' />
                <Button type='primary'>Search</Button>
            </div>

            <Divider />

            <div style={{ textAlign: "end" }}>
                <Button type='primary' onClick={() => {
                    setVisibleModalAddRoom(true)
                }}>
                    + Add new room
                </Button>
            </div>

            <Scrollbar style={{ height: "calc(100vh - 200px)", overflow: "hidden", marginTop: 10 }}>
                {
                    roomsDataOnSnapShot && !_.isEmpty(roomsDataOnSnapShot) && roomsDataOnSnapShot.map((room: DocumentData) => {
                        return <RoomComponent
                            room={room}
                        />
                    })

                }
            </Scrollbar>

        </div>
        <ModalAddEditRoom
            visible={visibleModalAddRoom}
            onClose={() => {
                setVisibleModalAddRoom(false)
            }} />
    </RoomsWrapper >
}

export default RoomsComponent


