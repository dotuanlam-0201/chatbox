import DrawerColSpecificComponent from '@/lib/chat/DrawerRoomsComponent'
import RoomsComponent from '@/lib/chat/RoomsComponent'
import DashboardLayout from '@/lib/layout/DashboardLayout'
import { RootState } from '@/lib/redux/store'
import { toggleVisibleMenuDiscuss } from '@/lib/redux/uiReducer'
import { Avatar, Col, Row } from 'antd'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createBreakpoint } from "react-use"

const useBreakpoint = createBreakpoint();

const ChatBoxComponent = () => {
    const dispatch = useDispatch()
    const breakpoint = useBreakpoint();
    const [visibleSpecificCol, setVisibleSpecificCol] = useState(false as boolean)

    useEffect(() => {
        if (breakpoint === 'tablet') {
            dispatch(toggleVisibleMenuDiscuss(true))
            setVisibleSpecificCol(false)
        } else {
            dispatch(toggleVisibleMenuDiscuss(false))
            setVisibleSpecificCol(true)
        }
    }, [breakpoint])



    return (
        <DashboardLayout
        >
            <Row>
                {visibleSpecificCol &&
                    <Col className=' bg-white border-r-2' xs={24} sm={12} md={12} lg={10} xl={8} xxl={8}>
                        <RoomsComponent
                        />
                    </Col>
                }
                <Col className=' min-h-screen flex-1'>
                    <div className={`bg-white p-5 flex justify-between items-center h-24 border-b-2`}>
                        <Row wrap={false} className=' w-full overflow-hidden' justify={"start"} align={"middle"} gutter={[10, 10]}>
                            <Col>
                                <Avatar src={"https://i.pinimg.com/564x/27/87/62/2787629fe39ee0bb053b9d1cf1906d33.jpg"} size={50} style={{ borderRadius: '50%' }} />
                            </Col>
                            <Col className='flex-1 leading-normal'>
                                <div>
                                    <span className='text-[24px] font-medium'>
                                        Obama
                                    </span>
                                </div>
                                <div style={{ maxHeight: "21px" }}>
                                    <span className=' text-[12px] text-[#b5b5b5] font-semibold'>
                                        Obama is Typing...
                                    </span>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </Col>
            </Row>
            
        </DashboardLayout>
    )
}

export default ChatBoxComponent
