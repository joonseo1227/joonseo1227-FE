"use client";

import {useEffect, useState} from 'react';
import styles from '@/styles/components/Comments.module.css';

// Function to generate a random nickname
const generateRandomNickname = () => {
    const adjectives = [
        '배고픈', '잊혀진', '불타는', '지친', '화난',
        '수상한', '전설의', '잠자는', '반짝이는', '초조한',
        '날아다니는', '무서운', '귀찮은', '행복한', '눈물의',
        '깜찍한', '폭주하는', '상처입은', '허당인',
    ];
    const nouns = [
        '참치', '두더지', '치킨', '고양이',
        '고라니', '강아지', '라면', '너구리', '좀비',
        '문어', '도마뱀', '토끼', '곰돌이',
        '수박', '비둘기', '타코야끼', '붕어빵'
    ];

    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNumber = Math.floor(Math.random() * 1000);

    return `${randomAdjective}${randomNoun}${randomNumber}`;
};

export default function Comments({postId}) {
    const [comments, setComments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [nickname, setNickname] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState({
        nickname: '',
        content: ''
    });

    // Initialize with a random nickname
    useEffect(() => {
        setNickname(generateRandomNickname());
    }, []);

    // Fetch comments when component mounts or postId changes
    useEffect(() => {
        const fetchComments = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/comments?postId=${postId}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch comments');
                }

                setComments(data.comments);
            } catch (err) {
                console.error('Error fetching comments:', err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        if (postId) {
            fetchComments();
        }
    }, [postId]);

    // Clear validation errors when input changes
    const handleInputChange = (field, value) => {
        if (field === 'nickname') {
            setNickname(value);
        } else if (field === 'content') {
            setContent(value);
        }

        // Clear validation error for this field
        if (validationErrors[field]) {
            setValidationErrors({
                ...validationErrors,
                [field]: ''
            });
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Reset validation errors
        const errors = {
            nickname: '',
            content: ''
        };

        // Custom validation
        let hasErrors = false;

        if (!nickname.trim()) {
            errors.nickname = '닉네임을 입력해주세요.';
            hasErrors = true;
        }

        if (!content.trim()) {
            errors.content = '댓글 내용을 입력해주세요.';
            hasErrors = true;
        }

        if (hasErrors) {
            setValidationErrors(errors);
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    postId,
                    nickname,
                    content,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to add comment');
            }

            // Add the new comment to the list
            setComments([...comments, data.comment]);

            // Clear the content field but keep the nickname
            setContent('');
        } catch (err) {
            console.error('Error adding comment:', err);
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.commentsContainer}>
            <h2 className={styles.commentsTitle}>댓글 {comments.length}개</h2>

            {/* Comment form */}
            <form onSubmit={handleSubmit} className={styles.commentForm}>
                <div className={styles.formGroup}>
                    <label htmlFor="nickname" className={styles.label}>닉네임</label>
                    <input
                        type="text"
                        id="nickname"
                        value={nickname}
                        onChange={(e) => handleInputChange('nickname', e.target.value)}
                        className={`${styles.nicknameInput} ${validationErrors.nickname ? styles.inputError : ''}`}
                    />
                    {validationErrors.nickname && (
                        <div className={styles.errorMessage}>{validationErrors.nickname}</div>
                    )}
                </div>

                <div className={styles.formGroup}>
                    <textarea
                        id="content"
                        placeholder={"댓글을 작성하세요"}
                        value={content}
                        onChange={(e) => handleInputChange('content', e.target.value)}
                        className={`${styles.contentInput} ${validationErrors.content ? styles.inputError : ''}`}
                        rows={3}
                    />
                    {validationErrors.content && (
                        <div className={styles.errorMessage}>{validationErrors.content}</div>
                    )}
                </div>

                <div className={styles.buttonContainer}>
                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? '등록 중...' : '댓글 등록'}
                    </button>
                </div>

            </form>

            {/* Comments list */}
            <div className={styles.commentsList}>
                {isLoading ? (
                    <p className={styles.hintMessage}>댓글을 불러오는 중...</p>
                ) : error ? (
                    <p className={styles.errorMessage}>댓글을 불러오는데 실패했습니다: {error}</p>
                ) : comments.length === 0 ? (
                    <p className={styles.hintMessage}>아직 댓글이 없습니다. 첫 댓글을 남겨보세요!</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className={styles.commentItem}>
                            <div className={styles.commentHeader}>
                                <span className={styles.commentAuthor}>{comment.nickname}</span>
                                <span className={styles.commentDate}>
                  {new Date(comment.created_at).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                  })}
                </span>
                            </div>
                            <p className={styles.commentContent}>{comment.content}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
