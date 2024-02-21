import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import {AutoDraft, BasicStorage, ChatProvider, Conversation, Presence, User, UserStatus} from "@chatscope/use-chat";
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

chatStorage.addConversation(new Conversation({
    id: '1',
}))
chatStorage.setActiveConversation('1');
chatStorage.addUser(new User({
    id: 'computer',
    username: 'komputer',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg',
    presence: new Presence({status: UserStatus.Available})
}))
const player = new User({
    id: 'player',
    username: 'gracz',
    avatar: 'https://api.dicebear.com/7.x/pixel-art/svg',
    presence: new Presence({status: UserStatus.Available})
});
chatStorage.addUser(player);
chatStorage.setCurrentUser(player);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ChatProvider serviceFactory={serviceFactory} storage={chatStorage} config={{
            typingThrottleTime: 250,
            typingDebounceTime: 900,
            debounceTyping: true,
            autoDraft: AutoDraft.Save | AutoDraft.Restore,
        }}>
            <App/>
        </ChatProvider>
    </React.StrictMode>,
)
