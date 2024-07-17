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

## Creating the Socket Context

```typescript
const SocketContext = createContext<any>(null);
```

## Context Provider Component

The `ContextProvider` component is responsible for initializing the socket connection and managing the state related to the socket:

## How to Use the Socket Context in Components

In other components, the SocketContext can be used to access the socket connection and related state and functions:

```typescript
import { useContext } from 'react';
import { AppContext } from '../path/to/context';

const SomeComponent = () => {
  const context = useContext(AppContext);

  // Use Context as needed
};
```

## Context Provider Value

The Context value includes the socket connection and various functions and state variables:

```typescript

const values = {
  loading,
  isMsgReceiving,
  messages,
  sendMessage,
  showWelcomePage,
  setShowWelcomePage,
  isDown,
  setIsDown,
  showFeedbackPopup,
  setShowFeedbackPopup,
  currentQuery,
  setCurrentQuery,
  isOnline,
  audioElement,
  setAudioElement,
  ...
};
```
