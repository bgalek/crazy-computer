import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import {
    Avatar,
    ChatContainer,
    ConversationHeader,
    MainContainer,
    Message,
    MessageGroup,
    MessageInput,
    MessageList,
    TypingIndicator
} from '@chatscope/chat-ui-kit-react';
import {
    ChatMessage,
    Conversation,
    MessageContentType,
    MessageDirection,
    MessageStatus,
    useChat
} from "@chatscope/use-chat";
import {useToggle} from "react-use";
import {askGpt} from "./hooks/useGpt.ts";
import {ChatRequestMessage} from "@azure/openai";
import {useEffect, useState} from "react";
import scenarios from "./scenarios.ts";
import JSConfetti from "js-confetti";

const jsConfetti = new JSConfetti();

function App() {
    const chat = useChat();
    const [typing, toggleTyping] = useToggle(true);
    const [level, setLevel] = useState(parseInt(window.sessionStorage.getItem("currentLevel") || "0"));

    useEffect(() => {
        window.sessionStorage.setItem("currentLevel", String(level));
        if (level < scenarios.levels.length) {
            askGpt(level).then(response => {
                chat.addConversation(new Conversation({id: String(level)}))
                chat.setActiveConversation(String(level));
                chat.addMessage(new ChatMessage<MessageContentType.TextPlain>({
                    id: '',
                    content: {content: response.choices[0]?.message?.content},
                    contentType: MessageContentType.TextPlain,
                    direction: MessageDirection.Incoming,
                    senderId: "system",
                    status: MessageStatus.Sent
                }), String(level), true);
                toggleTyping();
            });
        }
    }, [level]);
    if (level > scenarios.levels.length) {
        return <p>Win</p>
    }
    return (
        <MainContainer>
            <ChatContainer>
                <ConversationHeader>
                    <Avatar src={chat.getUser('system')?.avatar} name="Zwariowany Komputer" status="available"/>
                    <ConversationHeader.Content userName="Zwariowany komputer" info={`Poziom: ${level + 1}`}/>
                </ConversationHeader>
                <MessageList typingIndicator={typing && <TypingIndicator content="Bot is typing"/>}>
                    {chat.currentMessages.map(messageGroup => {
                        const user = chat.getUser(messageGroup.senderId);
                        return (
                            <MessageGroup key={messageGroup.id} direction={messageGroup.direction}
                                          sender={messageGroup.senderId}>
                                <Avatar src={user?.avatar} name={user?.username}/>
                                <MessageGroup.Messages>
                                    {messageGroup.messages.map(message => (
                                            <Message key={`${messageGroup.id}-${message.id}`} model={{
                                                message: message.content.content as string,
                                                sender: message.senderId,
                                                direction: message.direction,
                                                position: "normal"
                                            }}/>
                                        )
                                    )}
                                </MessageGroup.Messages>
                            </MessageGroup>
                        );
                    })}
                </MessageList>
                <MessageInput
                    disabled={typing}
                    placeholder="Tu napisz swoją wiadomość..."
                    attachButton={false}
                    autoFocus
                    onSend={onSend}/>
            </ChatContainer>
        </MainContainer>
    )

    function onSend(content: string) {
        const currentScenario = scenarios.levels[level];
        if (currentScenario.inputFilter(content || "")) {
            chat.addMessage(new ChatMessage<MessageContentType.TextPlain>({
                id: '',
                content: {content: "Wykryto niedozwolone hasła, wiadomość została zablokowana!"},
                contentType: MessageContentType.TextPlain,
                direction: MessageDirection.Incoming,
                senderId: "system",
                status: MessageStatus.Sent
            }), String(level), true);
            return;
        }
        chat.addMessage(new ChatMessage<MessageContentType.TextPlain>({
            id: '',
            content: {content},
            contentType: MessageContentType.TextPlain,
            direction: MessageDirection.Outgoing,
            senderId: "user",
            status: MessageStatus.Sent
        }), String(level), true);
        if (currentScenario.winCondition(content)) {
            jsConfetti.addConfetti();
            chat.addMessage(new ChatMessage<MessageContentType.TextPlain>({
                id: '',
                content: {content: "ZWYCIĘSTWO! TRWA RESTOWANIE KOMPUTERA...."},
                contentType: MessageContentType.TextPlain,
                direction: MessageDirection.Incoming,
                senderId: "system",
                status: MessageStatus.Sent
            }), String(level), true);
            toggleTyping();
            setLevel(prev => prev + 1);
            return;
        }
        toggleTyping();
        const conversionHistory: ChatRequestMessage[] = chat.currentMessages.flatMap(it => it.messages).map(message => ({
            role: message.senderId === 'system' ? "assistant" : 'user',
            content: message.content.content as string
        }));
        conversionHistory.push({role: "user", content});
        conversionHistory.shift();
        askGpt(level, conversionHistory).then(response => {
            const content = response.choices[0]?.message?.content;
            if (currentScenario.outputFilter(content || "")) {
                chat.addMessage(new ChatMessage<MessageContentType.TextPlain>({
                    id: '',
                    content: {content: "Wykryto próbę nieautoryzowanego dostępu, odpowiedź zablokowana."},
                    contentType: MessageContentType.TextPlain,
                    direction: MessageDirection.Incoming,
                    senderId: "system",
                    status: MessageStatus.Sent
                }), String(level), true);

            } else {
                chat.addMessage(new ChatMessage<MessageContentType.TextPlain>({
                    id: '',
                    content: {content},
                    contentType: MessageContentType.TextPlain,
                    direction: MessageDirection.Incoming,
                    senderId: "system",
                    status: MessageStatus.Sent
                }), String(level), true);

            }
            toggleTyping(false);
        });
    }
}

export default App
