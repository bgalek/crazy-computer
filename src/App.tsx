import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import {
    Avatar,
    ChatContainer, ConversationHeader,
    MainContainer,
    Message,
    MessageGroup,
    MessageInput,
    MessageList,
    TypingIndicator
} from '@chatscope/chat-ui-kit-react';
import {ChatMessage, MessageContentType, MessageDirection, MessageStatus, useChat} from "@chatscope/use-chat";
import {useTimeoutFn, useToggle} from "react-use";

function App() {
    const chat = useChat();
    const [typing, toggleTyping] = useToggle(true);
    useTimeoutFn(() => {
        chat.addMessage(new ChatMessage<MessageContentType.TextPlain>({
            id: '',
            content: {content: 'Welcome human!'},
            contentType: MessageContentType.TextPlain,
            direction: MessageDirection.Incoming,
            senderId: "computer",
            status: MessageStatus.Sent
        }), 'main', true);
    }, 1000)

    useTimeoutFn(() => {
        chat.addMessage(new ChatMessage<MessageContentType.TextPlain>({
            id: '',
            content: {content: 'We\'re gonna have fun!'},
            contentType: MessageContentType.TextPlain,
            direction: MessageDirection.Incoming,
            senderId: "computer",
            status: MessageStatus.Sent
        }), 'main', true);
        toggleTyping();
    }, 2500)

    return (
        <>
            <MainContainer>
                <ChatContainer>
                    <ConversationHeader>
                        <Avatar src={chat.getUser('1')?.avatar} name="Joe" status="available" />
                        <ConversationHeader.Content userName="Zwariowany komputer" info="Uruchominy od 10 minut" />
                    </ConversationHeader>
                    <MessageList typingIndicator={typing && <TypingIndicator content="Bot is typing"/>}>
                        {chat.currentMessages.map(messageGroup => {
                            const user = chat.getUser(messageGroup.senderId);
                            return (
                                <MessageGroup key={messageGroup.id} direction={messageGroup.direction}
                                              sender={messageGroup.senderId}>
                                    <Avatar src={user?.avatar} name={user?.username} />
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
                                          senderId: "player",
                                          status: MessageStatus.Sent
                                      }), 'main', true);
                                      toggleTyping();
                                      setTimeout(() => {
                                          chat.addMessage(new ChatMessage<MessageContentType.TextPlain>({
                                              id: '',
                                              content: {content: 'Na bank!'},
                                              contentType: MessageContentType.TextPlain,
                                              direction: MessageDirection.Incoming,
                                              senderId: "computer",
                                              status: MessageStatus.Sent
                                          }), 'main', true);
                                          toggleTyping();
                                      }, 1300)
;
                                  }}/>
                </ChatContainer>
            </MainContainer>
        </>
    )
}

export default App
