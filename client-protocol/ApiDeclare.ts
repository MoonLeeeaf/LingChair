export * from 'lingchair-internal-shared'

import { ClientEvent } from "lingchair-internal-shared"

import Message from "./Message.ts"

export type ClientEventData<T extends ClientEvent> = 
    T extends "Client.onMessage" ? { message: Message } :
    never

export type ClientEventCallback<T extends ClientEvent> = (data: ClientEventData<T>) => void
