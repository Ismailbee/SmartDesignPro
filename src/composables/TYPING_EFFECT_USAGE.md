# Typing Effect Usage Guide

## Overview
The typing effect displays pre-generated AI responses character by character, creating a natural conversation feel without blocking the UI.

## How It Works

### 1. Message Structure
Messages that should have a typing effect need these properties:
```typescript
{
  id: 1,
  text: '', // Will be populated by typing effect
  fullText: 'The complete AI response text that will be typed out',
  sender: 'ai',
  time: '10:30 AM',
  isTyping: true // Enable typing effect for this message
}
```

### 2. Adding a Typing Message
When the AI generates a response, create the message with `isTyping: true` and `fullText`:

```typescript
// Example: Adding a new AI message with typing effect
const aiResponse = "Hello! I've analyzed your information and here's what I found..."

messages.value.push({
  id: Date.now(),
  text: '', // Start empty
  fullText: aiResponse, // Full text to type
  sender: 'ai',
  time: new Date().toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit' 
  }),
  isTyping: true // Enable typing effect
})
```

### 3. Configuration
The typing effect has these settings:

- **Speed**: 30ms per character (configurable in the component)
- **Auto-scroll**: Automatically scrolls as text appears
- **Interruptible**: Stops cleanly when new messages arrive

### 4. Complete Example

```typescript
// In your composable or component that manages chat
import { ref } from 'vue'

const messages = ref<ChatMessage[]>([])

async function sendMessage(userMessage: string) {
  // 1. Add user message
  messages.value.push({
    id: Date.now(),
    text: userMessage,
    sender: 'user',
    time: getCurrentTime()
  })
  
  // 2. Get AI response (already fully generated)
  const aiResponse = await generateAIResponse(userMessage)
  
  // 3. Add AI message with typing effect
  messages.value.push({
    id: Date.now() + 1,
    text: '', // Will be filled by typing animation
    fullText: aiResponse, // Complete response
    sender: 'ai',
    time: getCurrentTime(),
    isTyping: true // Enable typing
  })
}

function getCurrentTime(): string {
  return new Date().toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit' 
  })
}
```

### 5. Without Typing Effect
For instant display (like user messages or system messages):

```typescript
messages.value.push({
  id: Date.now(),
  text: 'This appears instantly',
  sender: 'ai',
  time: getCurrentTime()
  // No isTyping or fullText needed
})
```

## Features

✅ **Non-blocking**: Uses requestAnimationFrame for smooth performance  
✅ **Auto-scroll**: Container scrolls as text grows  
✅ **Clean interruption**: Stops gracefully when new messages arrive  
✅ **Blinking cursor**: Visual indicator during typing  
✅ **Configurable speed**: Adjust typing speed per message  

## Implementation Details

### Component: `LetterHeadChatMessages.vue`

The component automatically detects messages with `isTyping: true` and:
1. Stores typing state per message ID
2. Animates text character by character
3. Shows a blinking cursor during typing
4. Auto-scrolls the chat container
5. Completes typing before showing action buttons

### Composable: `useTypingEffect.ts`

Provides the core typing logic:
- `startTyping(text, options)` - Begin typing animation
- `stopTyping()` - Stop animation and clear text
- `skipToEnd()` - Jump to complete text instantly
- `displayedText` - Reactive text that updates per character
- `isTyping` - Boolean indicating animation state

## Customization

### Change Typing Speed
Edit the `speed` constant in the component:
```typescript
const speed = 30 // Change to 50 for slower, 15 for faster
```

### Custom Styling
The typing cursor can be styled via `.typing-cursor` class:
```css
.typing-cursor {
  color: #06b6d4;
  animation: blink 1s step-end infinite;
}
```

## Best Practices

1. **Always provide fullText**: The complete response must be in `fullText` property
2. **Unique message IDs**: Use `Date.now()` or increment counter for unique IDs
3. **Don't mix typing with actions**: Action buttons should wait until typing completes
4. **Keep speed reasonable**: 20-50ms per character works best
5. **Test with long messages**: Ensure performance with 500+ character responses

## Troubleshooting

**Typing doesn't start**
- Verify `isTyping: true` is set
- Check that `fullText` contains the complete message
- Ensure message ID is unique

**Text appears instantly**
- Check if `isTyping` property is missing
- Verify the typing watch effect is triggering

**Performance issues**
- Increase typing speed (higher ms value)
- Check for memory leaks in typing state map
- Verify old typing animations are cleaned up

## Example in Practice

```typescript
// useLetterHeadChat.ts
function addAIMessage(content: string, withTyping = true) {
  const message: ChatMessage = {
    id: Date.now(),
    sender: 'ai',
    time: getCurrentTime(),
    text: withTyping ? '' : content,
    ...(withTyping && {
      isTyping: true,
      fullText: content
    })
  }
  
  messages.value.push(message)
}

// Usage
addAIMessage('✅ I found your organization details...', true) // With typing
addAIMessage('Processing complete!', false) // Instant display
```
