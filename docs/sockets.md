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

## Creating a New Socket Instance

In the provided code, a new UCI instance is created to establish a WebSocket connection for real-time communication. This instance is responsible for sending and receiving messages.

```typescript

       new UCI(
         URL,
         {
           transportOptions: {
             polling: {
               extraHeaders: {

                 channel: 'akai',
               },
             },
           },
           path: process.env.NEXT_PUBLIC_SOCKET_PATH || '',
           query: {
             deviceId:'',
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
const sendMessage = useCallback(async (textToSend: string, media: any = null) => {
  socket.sendMessage({
    payload: {
      text: textToSend,
      media,
      messageId: {
        Id: '',
        channelMessageId: '',
      },
    },
  });
}, []);
```

## Receiving Messages

The `onMessageReceived` callback processes incoming messages and updates the chat state based on the message type (TEXT, AUDIO, IMAGE, etc.).

```typescript
const onMessageReceived = useCallback(
  async (msg: any) => { ... },
  [isOnline, updateMsgState]
);

```
