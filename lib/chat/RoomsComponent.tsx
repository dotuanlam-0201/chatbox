import { Button, Divider, Form, Input, Modal, Tooltip } from 'antd'
import { DocumentData } from 'firebase/firestore'
import _ from "lodash"
import { AiOutlineSearch, AiOutlineUsergroupAdd } from 'react-icons/ai'
import { BiMessageSquareDetail } from 'react-icons/bi'
import Scrollbar from 'react-scrollbars-custom'
import { useSessionStorage } from 'react-use'
import { useFirestoreOnSnapshot } from '../hooks/useFirestoreOnSnapshot'
import RoomComponent from './RoomComponent'
import { useState } from 'react'
import { CHATBOXCONSTANT } from "../CONTANT"
import { useForm } from 'antd/es/form/Form'


const RoomsComponent = () => {
    const [id, setid] = useSessionStorage('id', '');
    const [visibleModalAddRoom, setVisibleModalAddRoom] = useState(false as boolean)
    const [loadingModal, setLoadingModal] = useState(false as boolean)
    const [form] = Form.useForm();

    const { document } = useFirestoreOnSnapshot({
        collectionName: "rooms",
        condition: {
            fieldName: "members",
            operator: "array-contains",
            compareValue: id
        }
    })

    const onAddNewRoom = () => {
        form.validateFields()
            .then((values: any) => {
                console.log(values);
            })
            .catch((err: any) => {
                return
            })
    }

    return <>
        <div className={`p-5 flex justify-between items-center h-24 border-b-2`}>
            <h4 className={`text-[${CHATBOXCONSTANT.colors.primaryColorBlue}] font-bold text-2xl`}>
                Messages
            </h4>
        </div>

        <div className=' p-5'>

            <div className='flex items-center justify-between'>
                <Input style={{ maxWidth: "90%" }} prefix={<AiOutlineSearch />} placeholder='Search...' />
                <span onClick={() => {
                    setVisibleModalAddRoom(true)
                }} className=' text-[24px] cursor-pointer'>
                    <Tooltip title="Add new room">
                        <AiOutlineUsergroupAdd />
                    </Tooltip>
                </span>
            </div>

            <Divider className=' m-2 border-none' />

            <span className='flex items-center text-[12px] text-[#a7a5a5] font-medium'>
                <BiMessageSquareDetail />
                <Divider type='vertical' className=' border-none mr-0 ' />
                All Rooms
            </span>

            <Scrollbar style={{ height: "530px", overflow: "hidden" }}>
                {
                    document && !_.isEmpty(document) && document.map((room: DocumentData) => {
                        return <RoomComponent
                            room={room}
                        />
                    })

                }
            </Scrollbar>

        </div>
        <Modal
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
                    name={"photoURL"}
                    rules={[{
                        required: true,
                        message: "Required"
                    }]}
                    label='Avatar'
                >
                    <Input placeholder="URL" />
                </Form.Item>
            </Form>
        </Modal>
    </>
}

export default RoomsComponent
