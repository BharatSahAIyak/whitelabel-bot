# Sockets

## Overview

This document provides an overview of the socket connection implementation used in this project. It details the packages used, how they are configured, and how the socket connection is managed within the application.

## Introduction

The `socket-package` manages the socket connections in the application, providing functionalities to connect, disconnect, send, and receive messages. This is done using a `ContextProvider ` component that sets up and manages the socket connection, providing it to the rest of the application through React's context API.

## Packages Used

[samagra-x/xmessage](https://www.npmjs.com/package/@samagra-x/xmessage): A package for handling messaging.
[socket-package](https://www.npmjs.com/package/socket-package): A custom package for managing socket connections.

## Environment Variables

```bash
NEXT_PUBLIC_SOCKET_URL: The URL of the socket server.
NEXT_PUBLIC_SOCKET_PATH: The path for the socket connection.
NEXT_PUBLIC_BOT_ID: The Bot ID for telemetry events.
NEXT_PUBLIC_ORG_ID: The Organization ID for telemetry events.
```

## Creating a New UCI Instance

In the provided code, a new UCI instance is created to establish a WebSocket connection for real-time communication. This instance is responsible for sending and receiving messages.

```typescript

       new UCI(
         URL,
         {
           transportOptions: {
             polling: {
               extraHeaders: {
                 // Authorization: `Bearer ${cookie.access_token}`,
                 channel: 'akai',
               },
             },
           },
           path: process.env.NEXT_PUBLIC_SOCKET_PATH || '',
           query: {
             deviceId: localStorage.getItem('userID'),
           },
           autoConnect: false,
           transports: ['polling', 'websocket'],
           upgrade: true,
         },
         onMessageReceived
       )
     );
   }

```

## Handling Messages

### Sending Messages

Once the UCI instance is created, you can use the sendMessage function to send messages to the WebSocket server. This function takes a message object conforming to the XMessage interface.

```typescript
  const sendMessage = useCallback(
    async (textToSend: string, textToShow: string, media: any, isVisibile = true) => {
      if (!textToShow) textToShow = textToSend;

      setLoading(true);
      setIsMsgReceiving(true);
      const messageId = s2tMsgId ? s2tMsgId : uuidv4();
      const cId = uuidv4();
      newSocket.sendMessage({
        payload: {
          app: process.env.NEXT_PUBLIC_BOT_ID || '',
          payload: {
            text: textToSend?.replace('&', '%26')?.replace(/^\s+|\s+$/g, ''),
            metaData: {
              phoneNumber: localStorage.getItem('phoneNumber') || '',
              latitude: localStorage.getItem('latitude'),
              longitude: localStorage.getItem('longitude'),
              city: localStorage.getItem('city'),
              state: localStorage.getItem('state'),
              ip: localStorage.getItem('ip'),
              hideMessage: textToSend?.startsWith('Guided:') || false,
              originalText: textToShow?.replace(/^\s+|\s+$/g, ''),
            },
          },
          tags: JSON.parse(sessionStorage.getItem('tags') || '[]') || [],
          from: {
            userID: localStorage.getItem('userID'),
          },
          messageId: {
            Id: messageId,
            channelMessageId: sessionStorage.getItem('conversationId') || cId,
          },
        } as Partial<XMessage>,
      });


```

## Receiving Messages

The `onMessageReceived` callback processes incoming messages and updates the chat state based on the message type (TEXT, AUDIO, IMAGE, etc.).

```typescript
const onMessageReceived = useCallback(
  async (msg: any) => {
    // if (!msg?.content?.id) msg.content.id = '';
    if (msg.messageType.toUpperCase() === 'IMAGE') {
      if (
        // msg.content.timeTaken + 1000 < timer2 &&
        isOnline
      ) {
        await updateMsgState({
          msg: msg,
          media: { imageUrls: msg?.content?.media_url },
        });
      }
    } else if (msg.messageType.toUpperCase() === 'AUDIO') {
      updateMsgState({
        msg,
        media: { audioUrl: msg?.content?.media_url },
      });
    } else if (msg.messageType.toUpperCase() === 'HSM') {
      updateMsgState({
        msg,
        media: { audioUrl: msg?.content?.media_url },
      });
    } else if (msg.messageType.toUpperCase() === 'VIDEO') {
      updateMsgState({
        msg,
        media: { videoUrl: msg?.content?.media_url },
      });
    } else if (
      msg.messageType.toUpperCase() === 'DOCUMENT' ||
      msg.messageType.toUpperCase() === 'FILE'
    ) {
      updateMsgState({
        msg,
        media: { fileUrl: msg?.content?.media_url },
      });
    } else if (msg.messageType.toUpperCase() === 'TEXT') {
      if (
        // msg.content.timeTaken + 1000 < timer2 &&
        isOnline
      ) {
        await updateMsgState({
          msg: msg,
          media: null,
        });
      }
    }
  },
  [isOnline, updateMsgState]
);
```
