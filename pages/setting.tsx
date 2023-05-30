import DashboardLayout from '@/lib/layout/DashboardLayout'
import React from 'react'
import { useLocalStorage } from 'react-use'

const SettingComponent = () => {
    return (
        <DashboardLayout>
            setting
        </DashboardLayout>
    )
}

export default SettingComponent

export const getServerSideProps = async () => {
    const [user, setUser] = useLocalStorage("user", "")
    if (!user) {
        return {
            redirect: { destination: '/login', permanent: false },
        }
    }
}
