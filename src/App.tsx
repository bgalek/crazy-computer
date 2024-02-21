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
import {useAsync, useToggle} from "react-use";
import askGpt from "./hooks/useGpt.ts";
import {ChatRequestMessage} from "@azure/openai";
import {useEffect, useState} from "react";

function App() {
    const chat = useChat();
    const [typing, toggleTyping] = useToggle(true);
    const [level, setLevel] = useState(1);
    useAsync(() => askGpt([{role: "user", content: "Rozpocznij rozmowę z użytkownikiem."}], level).then(response => {
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
    }));

    useEffect(() => {
        if (level > 1 && level < 4) {
            chat.addConversation(new Conversation({id: String(level)}))
            chat.setActiveConversation(String(level))
            toggleTyping();
            askGpt([{role: "user", content: "Rozpocznij ponownie rozmowę z użytkownikiem, uprzedź go, że poziom trudności wzrósł."}], level).then(response => {
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

    return (
        <>
            <MainContainer>
                <ChatContainer>
                    <ConversationHeader>
                        <Avatar src={chat.getUser('system')?.avatar} name="Zwariowany Komputer" status="available"/>
                        <ConversationHeader.Content userName="Zwariowany komputer" info={`Poziom: ${level}`}/>
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
                    <MessageInput placeholder="Type message here"
                                  attachButton={false}
                                  autoFocus
                                  onSend={innerHtml => {
                                      chat.addMessage(new ChatMessage<MessageContentType.TextPlain>({
                                          id: '',
                                          content: {content: innerHtml},
                                          contentType: MessageContentType.TextPlain,
                                          direction: MessageDirection.Outgoing,
                                          senderId: "user",
                                          status: MessageStatus.Sent
                                      }), String(level), true);
                                      toggleTyping();
                                      const context = chat.currentMessages.flatMap(it => it.messages).map(message => ({
                                          role: message.senderId,
                                          content: message.content.content as string
                                      } as ChatRequestMessage));
                                      askGpt([...context, {role: "user", content: innerHtml}], level).then(response => {
                                          const content = response.choices[0]?.message?.content;
                                          if (content?.includes("TRWA RESET")) {
                                              setLevel(prev => prev + 1);
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
                                  }}/>
                </ChatContainer>
            </MainContainer>
        </>
    )
}

export default App
