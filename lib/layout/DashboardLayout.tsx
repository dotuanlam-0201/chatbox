import { Avatar, Layout, Typography } from 'antd';
import Link from 'next/link';
import { ReactNode, useEffect, useState } from 'react';
import { AiFillMessage } from "react-icons/ai";
import { createBreakpoint, useSessionStorage } from 'react-use';
import MainMenu from './MainMenu';
import DrawerRoomsComponent from '../chat/DrawerRoomsComponent';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { CHATBOXCONSTANT } from '../CONTANT';
import styled from "styled-components"
import { dispatchUser } from '../redux/userReducer';
import { useRouter } from 'next/router';
interface IDashboardLayoutProps {
    children?: ReactNode
}

const useBreakpoint = createBreakpoint({ XL: 1280, L: 576, S: 350 });

const DashboardLayout = (props: IDashboardLayoutProps) => {
    const breakpoint = useBreakpoint();

    const router = useRouter()
    const [collapsedMenu, setSollapsedMenu] = useState(false as boolean)
    const [sesstion, setSesstion] = useSessionStorage('user', '');
    const [user, setUser] = useState({} as any)
    const { displayName, photoURL, email } = user
    const visibleDrawerDiscuss = useSelector((state: RootState) => state.uiReducer.visibleDrawerDiscuss)
    const dispatch = useDispatch()

    useEffect(() => {
        if (sesstion) {
            setUser((sesstion))
        } else {
            router.replace('/login')
            setUser({})
        }
        return () => {
            setUser({})
        }
    }, [sesstion])

    useEffect(() => {
        if (user) {
            dispatch(dispatchUser(user))
        }
    }, [user])


    return (
        <Layout
            style={{ minHeight: "100vh" }}
            hasSider
        >
            <Layout.Sider
                onCollapse={(collapsed, type) => {
                    setSollapsedMenu(collapsed)
                }}
                collapsed={collapsedMenu}
                collapsible={true}
                width={250}
                collapsedWidth={50}
                theme={'light'}
            >
                <div style={{
                    display: "grid",
                    placeItems: "center",
                    height: "8rem",
                    fontSize: 32
                }}>
                    <Link href={"/chat"}>
                        <Typography.Text
                            style={{ display: "flex", alignItems: "center", fontSize: 32, fontWeight: "bolder", color: CHATBOXCONSTANT.colors.primaryColorBlue }}>
                            <AiFillMessage />
                            {!collapsedMenu && 'ChatBox'}
                        </Typography.Text>
                    </Link>
                </div>
                <MainMenu
                />
                <div style={{ display: "flex", alignItems: "center", gap: "5px", padding: 10, position: "absolute", bottom: 40 }}>
                    <Avatar size={collapsedMenu ? 25 : 35} src={photoURL} >
                        {!photoURL && displayName?.charAt(0)}
                    </Avatar>
                    {
                        !collapsedMenu &&
                        <div>
                            <Typography.Text style={{ display: "block", fontWeight: 600 }}>{displayName}</Typography.Text>
                            <Typography.Text style={{ fontSize: 11, color: "gray" }}>{email}</Typography.Text>
                        </div>
                    }
                </div>

            </Layout.Sider>
            <Layout.Content
            >
                {props.children}
            </Layout.Content>
            <DrawerRoomsComponent
                breakpoint={breakpoint}
                visible={visibleDrawerDiscuss}
            />
        </Layout >
    )
}

export default DashboardLayout
