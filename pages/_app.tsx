import { store } from '@/lib/redux/store';
import { AppProps } from 'next/app';
import { Provider } from 'react-redux';

import "../globals.css";



const AppComponent = ({ Component, pageProps }: AppProps) => {

    return <Provider store={store}>
            <Component {...pageProps} />
    </Provider>

}

export default AppComponent
