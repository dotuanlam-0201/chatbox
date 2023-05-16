import { configureStore } from '@reduxjs/toolkit'
import uiReducer from "./uiReducer/index"
import userReducer from './userReducer'

export const store = configureStore({
    reducer: {
        uiReducer: uiReducer,
        userReducer: userReducer,
    },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch