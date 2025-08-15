import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';

interface ChatInputProps {
  chatId: string;
  onSend?: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ chatId, onSend }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const { sendMessage } = useChatStore();
  const { user } = useAuthStore();

  const handleSend = async () => {
    if (!message.trim() || !user) return;

    const trimmedMessage = message.trim();
    setMessage('');
    setIsTyping(false);

    try {
      await sendMessage(chatId, user.id, trimmedMessage);
      onSend?.();
    } catch (error) {
      console.error('メッセージ送信エラー:', error);
      // エラー時はメッセージを復元
      setMessage(trimmedMessage);
    }
  };

  const handleTextChange = (text: string) => {
    setMessage(text);
    setIsTyping(text.length > 0);
  };

  const handleKeyPress = (e: any) => {
    if (Platform.OS === 'web' && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  useEffect(() => {
    // コンポーネントマウント時にフォーカス
    const timer = setTimeout(focusInput, 100);
    return () => clearTimeout(timer);
  }, []);

    return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          style={styles.textInput}
          value={message}
          onChangeText={handleTextChange}
          onKeyPress={handleKeyPress}
          placeholder="メッセージを入力..."
          placeholderTextColor="#9CA3AF"
          multiline
          maxLength={1000}
          textAlignVertical="center"
          returnKeyType="default"
          blurOnSubmit={false}
        />
        
                 <TouchableOpacity
           style={[
             styles.sendButton,
             isTyping ? styles.sendButtonActive : styles.sendButtonInactive
           ]}
           onPress={handleSend}
           disabled={!isTyping}
           activeOpacity={0.7}
           testID="send-button"
         >
          <Ionicons
            name="send"
            size={20}
            color={isTyping ? '#FFFFFF' : '#9CA3AF'}
          />
        </TouchableOpacity>
      </View>
      
      {message.length > 0 && (
        <View style={styles.characterCount}>
          <Text style={styles.characterCountText}>
            {message.length}/1000
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 12, // iOSのセーフエリア対応
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    maxHeight: 100,
    minHeight: 20,
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonActive: {
    backgroundColor: '#6366F1',
  },
  sendButtonInactive: {
    backgroundColor: 'transparent',
  },
  characterCount: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  characterCountText: {
    fontSize: 12,
    color: '#9CA3AF',
  },

});

export default ChatInput;
