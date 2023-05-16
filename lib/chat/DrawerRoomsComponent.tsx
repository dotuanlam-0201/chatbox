import { Drawer } from 'antd'
import { useDispatch } from 'react-redux'
import { toggleVisibleDrawerDiscuss } from '../redux/uiReducer'
import RoomsComponent from './RoomsComponent'

interface IDrawerColSpecificProps {
    visible: boolean
    breakpoint: string
}

const DrawerRoomsComponent = (props: IDrawerColSpecificProps) => {
    const dispatch = useDispatch()
    return <Drawer
        placement='left'
        bodyStyle={{ marginBottom: 50, paddingTop: 0 }}
        title={"Rooms"}
        open={props.visible}
        onClose={() => {
            dispatch(toggleVisibleDrawerDiscuss(false))
        }}
        maskClosable={false}
        width={props.breakpoint === "S" ? "100%" : "450px"}
    >
        <RoomsComponent
        />
    </Drawer>
}

export default DrawerRoomsComponent
