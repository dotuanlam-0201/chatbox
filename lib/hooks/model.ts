export type TypeRooms = {
    createAt: number
    members: string[],
    roomName: string
    createBy: string
}

export type TypePayloadRoom = {
    avatar: string
    createAt?: number
    createBy: string
    members: string[]
    name: string
}