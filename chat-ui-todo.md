# Chat UI with Toggle-able Sidebar – Checklist

## 1. Project Structure & Setup

- [x] Create a `components/` directory for reusable UI components.
- [ ] Create a `pages/` or `views/` directory for main app screens (if not already present).
- [x] Ensure TailwindCSS is configured and working.
- [x] Ensure shadcn/ui components are available for use.

## 2. Sidebar (Chat History)

- [x] Create a `Sidebar` component.
- [x] Add a toggle button to show/hide the sidebar.
- [x] Display a list of previous chat sessions/messages in the sidebar.
- [x] Highlight the currently selected chat.
- [x] Allow selecting a chat to load its messages.
- [x] Add user menu to the sidebar.

## 3. Chat Window

- [x] Create a `ChatWindow` component.
- [x] Display messages for the selected chat session.
- [x] Style messages differently for user and assistant.
- [x] Auto-scroll to the latest message.

## 4. Message Input

- [x] Create a `ChatInput` component.
- [x] Add a text input for composing messages.
- [x] Add a send button.
- [x] Handle sending messages (update chat state).

## 5. State Management

- [x] Store chat history and messages in React state (or context).
- [x] Implement logic to add new messages and sessions.
- [ ] Optionally, persist chat history to localStorage.

## 6. UI/UX Enhancements

- [ ] Add loading indicators for assistant responses.
- [ ] Add basic error handling (e.g., failed message send).
- [x] Make the layout responsive for mobile/desktop.
- [ ] Add transitions/animations for sidebar toggle (using tailwindcss-animate).

## 7. Optional Features

- [ ] Support for deleting chat sessions.
- [ ] Support for renaming chat sessions.
- [ ] Keyboard shortcuts (e.g., toggle sidebar, send message).
- [x] Theming (light/dark mode) - Default dark mode enabled.

---

**Next Steps:**  
Start by scaffolding the main layout with sidebar and chat window, then incrementally build out each component and feature.
