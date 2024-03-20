

import { Provider } from 'react-redux';
import { store } from '../store'; 
import { FC, ReactElement } from 'react';

export const ReduxProvider: FC<{ children: React.ReactNode }> = ({ children }): ReactElement => {
const _store = store();
    return (
        <Provider store={_store}>
            {children}
        </Provider>
    );
}