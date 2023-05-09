import { Drawer } from 'antd'
import { useDispatch } from 'react-redux'
import { toggleVisibleDrawerDiscuss } from '../redux/uiReducer'
import ColSpecificComponent from './RoomsComponent'
import RoomsComponent from './RoomsComponent'

interface IDrawerColSpecificProps {
    visible: boolean
}

const DrawerColSpecificComponent = (props: IDrawerColSpecificProps) => {
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
        width={"100%"}
    >
        <RoomsComponent
        />
    </Drawer>
}

export default DrawerColSpecificComponent
