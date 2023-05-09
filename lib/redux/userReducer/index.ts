import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface userState {
    displayName?: string,
    photoURL?: string,
    id?: string,
    email?: string
}

const initialState: userState = {
    displayName: undefined,
    photoURL: undefined,
    id: undefined,
    email: undefined
}

export const userSlice = createSlice({
    name: 'userSlice',
    initialState,
    reducers: {
        dispatchUser: (state, action: PayloadAction<userState>) => {
            return { ...state, ...action.payload }
        }
    },
})

// Action creators are generated for each case reducer function
export const { dispatchUser } = userSlice.actions

export default userSlice.reducer