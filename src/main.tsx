import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import {AutoDraft, BasicStorage, ChatProvider, Presence, User, UserStatus} from "@chatscope/use-chat";
import {nanoid} from "nanoid";
import {ExampleChatService} from "@chatscope/use-chat/dist/examples";
import {ChatServiceFactory} from "@chatscope/use-chat/src/Types.ts";
import {IChatService} from "@chatscope/use-chat/src/interfaces";

// Storage needs to generate id for messages and groups
const messageIdGenerator = () => nanoid();
const groupIdGenerator = () => nanoid();

const serviceFactory: ChatServiceFactory<IChatService> = (storage, updateState) => {
    return new ExampleChatService(storage, updateState);
};

const chatStorage = new BasicStorage({groupIdGenerator, messageIdGenerator});

chatStorage.addUser(new User({
    id: 'system',
    username: 'system',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg',
    presence: new Presence({status: UserStatus.Available})
}))
const player = new User({
    id: 'user',
    username: 'user',
    avatar: 'https://api.dicebear.com/7.x/pixel-art/svg',
    presence: new Presence({status: UserStatus.Available})
});
chatStorage.addUser(player);
chatStorage.setCurrentUser(player);

if (!window.sessionStorage.getItem("CRAZY_COMPUTER_KEY")) {
    const key = window.prompt("Podaj klucz API");
    if (key) {
        window.sessionStorage.setItem("CRAZY_COMPUTER_KEY", key);
        window.location.reload();
    } else {
        ReactDOM.createRoot(document.getElementById('root')!).render(
            <p>nie podano klucza api</p>
        )
    }
} else {
    ReactDOM.createRoot(document.getElementById('root')!).render(
        <ChatProvider serviceFactory={serviceFactory} storage={chatStorage} config={{
            typingThrottleTime: 250,
            typingDebounceTime: 900,
            debounceTyping: true,
            autoDraft: AutoDraft.Save | AutoDraft.Restore,
        }}>
            <App/>
        </ChatProvider>
    )
}
