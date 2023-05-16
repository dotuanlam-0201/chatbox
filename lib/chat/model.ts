export type TypeMessage = {
    displayName: string,
    id: string,
    photoURL: string,
    email: string,
    message: string,
    sendAt: {
        nanoseconds: number
        seconds: number
    }
}