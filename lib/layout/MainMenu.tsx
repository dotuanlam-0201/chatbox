import { Menu } from 'antd'
import _ from "lodash"
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { AiOutlineMessage, AiOutlineSetting } from "react-icons/ai"
import { BiLogOut } from 'react-icons/bi'
import { GiDiscussion } from 'react-icons/gi'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../redux/store'
import { toggleVisibleDrawerDiscuss, toggleVisibleMenuDiscuss } from '../redux/uiReducer'
import { auth } from '@/firebase/config'
import { useSessionStorage } from 'react-use'

interface IMainMenuProps {

}

const MainMenu = (props: IMainMenuProps) => {
    const [selectedKeys, setSelectedKeys] = React.useState("")
    const [sesstion, setSesstion] = useSessionStorage('user', '');
    const router = useRouter();
    const [itemsMenu, setItemsMenu] = useState(
        [
            {
                label: "Chat",
                key: 'chat',
                icon: <AiOutlineMessage />,
            },
            {
                label: "Setting",
                key: 'setting',
                icon: <AiOutlineSetting />,
            },
            {
                label: "Logout",
                key: 'logout',
                icon: <BiLogOut />,
            },

        ]
    )

    const visibleMenuDiscuss = useSelector((state: RootState) => state.uiReducer.visibleMenuDiscuss)
    const dispatch = useDispatch()

    useEffect(() => {
        const checkExistMenu = _.find(itemsMenu, (o: any) => o.key === "discuss");
        if (!checkExistMenu && visibleMenuDiscuss) {
            setItemsMenu([...itemsMenu, ...[{
                label: "Discuss",
                key: 'discuss',
                icon: <GiDiscussion />,
            }]])
        } else {
            const newItemsMene = _.filter(itemsMenu, (o: any) => o.key !== "discuss")
            setItemsMenu(newItemsMene)
        }
    }, [visibleMenuDiscuss])


    useEffect(() => {
        const { pathname } = router
        setSelectedKeys(pathname.replace("/", ""))
    }, [router])

    return (
        <Menu
            onClick={(e: any) => {
                if (e.key === "chat") {
                    router.push({
                        pathname: "/chat"
                    })
                } else if (e.key === "setting") {
                    router.push({
                        pathname: "/setting"
                    })
                } else if (e.key === "logout") {
                    setSesstion("")
                    router.push("/login")                
                } else if (e.key === "discuss") {
                    dispatch(toggleVisibleDrawerDiscuss(true))
                }
            }}
            defaultSelectedKeys={[selectedKeys]}
            selectedKeys={[selectedKeys]}
            theme='light'
            items={itemsMenu}
        />
    )
}

export default MainMenu
