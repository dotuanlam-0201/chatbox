import { Avatar, Layout } from 'antd';
import Link from 'next/link';
import { ReactNode, useEffect, useState } from 'react';
import { AiFillMessage } from "react-icons/ai";
import { useSessionStorage } from 'react-use';
import MainMenu from './MainMenu';
import DrawerColSpecificComponent from '../chat/DrawerRoomsComponent';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { CHATBOXCONSTANT } from '../CONTANT';

interface IDashboardLayoutProps {
    children?: ReactNode
}

const DashboardLayout = (props: IDashboardLayoutProps) => {
    const [collapsedMenu, setSollapsedMenu] = useState(false as boolean)
    const [sesstion, setSesstion] = useSessionStorage('user', '');
    const [user, setUser] = useState({} as any)
    const { displayName, photoURL, email } = user
    const visibleDrawerDiscuss = useSelector((state: RootState) => state.uiReducer.visibleDrawerDiscuss)

    useEffect(() => {
        if (sesstion) {
            setUser((sesstion))
        } else {
            setUser({})
        }
        return () => {
            setUser({})
        }
    }, [sesstion])


    return (
        <Layout
            hasSider
            className='h-screen'
        >
            <Layout.Sider
                className=' border-r-2'
                onCollapse={(collapsed, type) => {
                    setSollapsedMenu(collapsed)
                }}
                collapsed={collapsedMenu}
                collapsible={true}
                width={250}
                collapsedWidth={50}
                theme={'light'}
            >
                <div className={`p-5 flex justify-center items-center h-24 border-b-2`}>
                    <Link href={"/chat"}>
                        <span className={`text-[${CHATBOXCONSTANT.colors.primaryColorBlue}] font-black text-[2rem] flex justify-center items-center`}>
                            <AiFillMessage />
                            {!collapsedMenu && 'ChatBox'}
                        </span>
                    </Link>
                </div>

                <div className=' p-3 flex items-center justify-start'>
                    <Avatar size={collapsedMenu ? 25 : 35} src={photoURL} >
                        {!photoURL && displayName?.charAt(0)}
                    </Avatar>
                    {
                        !collapsedMenu &&
                        <span className=' ml-2'>
                            <div className=' font-semibold'>{displayName}</div>
                            <div className='text-[11px] text-[#a7a5a5]'>{email}</div>
                        </span>
                    }
                </div>

                <MainMenu
                />

            </Layout.Sider>
            <Layout.Content
            >
                {props.children}
            </Layout.Content>
            <DrawerColSpecificComponent
                visible={visibleDrawerDiscuss}
            />
        </Layout>
    )
}

export default DashboardLayout
