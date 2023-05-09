import { store } from '@/lib/redux/store';
import { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { useSessionStorage } from 'react-use';

import "../globals.css";



const AppComponent = ({ Component, pageProps }: AppProps) => {
    const router = useRouter()
    const [sesstion, setSesstion] = useSessionStorage('user', '');
    useEffect(() => {
        if (!sesstion) {
            router.replace('/login')
        } else {
            router.replace('/chat')
        }
    }, [sesstion])

    return <Provider store={store}>
            <Component {...pageProps} />
    </Provider>

}

export default AppComponent
