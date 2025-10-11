import styles from '@/styles/components/EmptyState.module.css';

export default function EmptyState({type = 'empty', message}) {
    const getDefaultMessage = () => {
        if (type === 'error') {
            return '데이터를 불러오는데 실패했습니다.';
        }
        return '게시물이 없습니다.';
    };

    return (
        <p className={styles.message}>{message || getDefaultMessage()}</p>
    );
}