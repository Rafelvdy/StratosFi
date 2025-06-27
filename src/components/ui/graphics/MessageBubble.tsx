import styles from './MessageBubble.module.css';

interface MessageBubbleProps {
    background?: 'sender' | 'receiver';
    children: React.ReactNode;
}

// export default function MessageBubble() {
//     return (
//         <div className={styles.MessageBubble}>
//             <div className={styles.MessageBubbleContent}>
//                 <div className={styles.MessageBubbleText}>Hello, how are you sdgafshSFhasfhasha?</div>
//             </div>
//         </div>
//     );
// }

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


