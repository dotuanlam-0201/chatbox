import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface uiSate {
    visibleMenuDiscuss: boolean
    visibleDrawerDiscuss: boolean
}

const initialState: uiSate = {
    visibleMenuDiscuss: false,
    visibleDrawerDiscuss: false
}

export const uiSlice = createSlice({
    name: 'counter',
    initialState,
    reducers: {
        toggleVisibleMenuDiscuss: (state, action: PayloadAction<boolean>) => {
            state.visibleMenuDiscuss = action.payload
        },
        toggleVisibleDrawerDiscuss: (state, action: PayloadAction<boolean>) => {
            state.visibleDrawerDiscuss = action.payload
        }
    },
})

// Action creators are generated for each case reducer function
export const { toggleVisibleMenuDiscuss, toggleVisibleDrawerDiscuss } = uiSlice.actions

export default uiSlice.reducer