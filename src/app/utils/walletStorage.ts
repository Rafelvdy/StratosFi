import { ChatMessage } from '../components/ChatPanel';

interface ChatHistory {
    messages: Array<Omit<ChatMessage, 'timestamp'> & { timestamp: string }>;
    lastUpdated: string;
}

export const STORAGE_PREFIX = 'stratosfi_chat_';

class WalletStorageError extends Error {
    constructor(message: string, public readonly code: string) {
        super(message);
        this.name = 'WalletStorageError';
    }
}

export function saveChatToWallet(walletAddress: string, messages: ChatMessage[]): void {
    try {
        const chatHistory: ChatHistory = {
            messages: messages.map(msg => ({
                ...msg,
                timestamp: msg.timestamp.toISOString()
            })),
            lastUpdated: new Date().toISOString()
        };
        
        const serializedData = JSON.stringify(chatHistory);
        localStorage.setItem(`${STORAGE_PREFIX}${walletAddress}`, serializedData);
        
        // Verify the save was successful
        const savedData = localStorage.getItem(`${STORAGE_PREFIX}${walletAddress}`);
        if (!savedData || savedData !== serializedData) {
            throw new WalletStorageError('Failed to verify saved data', 'SAVE_VERIFICATION_FAILED');
        }
    } catch (error) {
        console.error('Error saving chat to wallet:', error);
        throw new WalletStorageError(
            error instanceof WalletStorageError 
                ? error.message 
                : 'Failed to save chat history',
            'SAVE_FAILED'
        );
    }
}

export function loadChatFromWallet(walletAddress: string): ChatMessage[] | null {
    try {
        const storedData = localStorage.getItem(`${STORAGE_PREFIX}${walletAddress}`);
        if (!storedData) {
            console.log('No stored data found for wallet:', walletAddress);
            return null;
        }

        const chatHistory: ChatHistory = JSON.parse(storedData);
        
        // Validate the loaded data structure
        if (!Array.isArray(chatHistory.messages)) {
            throw new WalletStorageError('Invalid chat history format', 'INVALID_FORMAT');
        }

        const messages = chatHistory.messages.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
        }));

        console.log('Loaded messages for wallet:', walletAddress, messages);
        return messages;
    } catch (error) {
        console.error('Error loading chat from wallet:', error);
        if (error instanceof WalletStorageError) {
            throw error;
        }
        throw new WalletStorageError(
            'Failed to load chat history',
            'LOAD_FAILED'
        );
    }
}

export function clearChatForWallet(walletAddress: string): void {
    try {
        console.log('Clearing chat for wallet:', walletAddress);
        localStorage.removeItem(`${STORAGE_PREFIX}${walletAddress}`);
        
        // Verify the clear was successful
        const remainingData = localStorage.getItem(`${STORAGE_PREFIX}${walletAddress}`);
        if (remainingData) {
            throw new WalletStorageError('Failed to clear chat history', 'CLEAR_VERIFICATION_FAILED');
        }
    } catch (error) {
        console.error('Error clearing chat for wallet:', error);
        throw new WalletStorageError(
            error instanceof WalletStorageError 
                ? error.message 
                : 'Failed to clear chat history',
            'CLEAR_FAILED'
        );
    }
} 