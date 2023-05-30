import DashboardLayout from '@/lib/layout/DashboardLayout'
import React from 'react'
import { useLocalStorage } from 'react-use'

const Home = () => {

    return (
        <DashboardLayout>
            home
        </DashboardLayout>
    )
}

export default Home

export const getServerSideProps = async () => {
    const [user, setUser] = useLocalStorage("user", "")
    if (!user) {
        return {
            redirect: { destination: '/login', permanent: false },
        }
    }
}
