import styles from './MessageBubble.module.css';

interface MessageBubbleProps {
    background?: 'sender' | 'receiver';
    children: React.ReactNode;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ background = 'sender', children }) => {
    const bgClass = background === 'sender' ? styles.sender : styles.receiver;
    return (
                <div className={`${styles.MessageBubble} ${bgClass}`}>
                    <div className={styles.MessageBubbleContent}>
                        <div className={styles.MessageBubbleText}>{children}</div>
                    </div>
                </div>
            );
        };

export default MessageBubble;


