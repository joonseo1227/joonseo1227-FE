"use client";

import { useState, useEffect, useRef } from 'react';
import styles from '@/styles/components/TableOfContents.module.css';

const TableOfContents = ({ content }) => {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState('');
  const headingRefs = useRef({});

  // 렌더링된 HTML에서 제목(heading) 요소 추출
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 콘텐츠가 렌더링될 때까지 잠시 대기
    setTimeout(() => {
      // 게시글 콘텐츠 영역 내의 heading 요소만 선택
      const headingElements = document.querySelector('[data-testid="post-content"]')?.querySelectorAll('h1, h2, h3, h4, h5, h6') || [];
      const extractedHeadings = Array.from(headingElements).map(element => {
        return {
          id: element.id,
          level: parseInt(element.tagName.substring(1)), // 태그 이름에서 수준 추출 (h1 -> 1, h2 -> 2 등)
          text: element.textContent
        };
      });

      setHeadings(extractedHeadings);
    }, 100);
  }, [content]);

  // 화면에 보이는 제목을 추적하기 위한 Intersection Observer 설정
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
        (entries) => {
          // 현재 화면에 보이는 heading 요소들 추출
          const visibleHeadings = entries
              .filter(entry => entry.isIntersecting)
              .map(entry => ({
                id: entry.target.id,
                offsetTop: entry.target.offsetTop
              }));

          if (visibleHeadings.length > 0) {
            // offsetTop 기준으로 정렬하여 가장 위에 있는 heading을 활성화
            visibleHeadings.sort((a, b) => a.offsetTop - b.offsetTop);
            setActiveId(visibleHeadings[0].id);
          }
        },
        {
          rootMargin: '0px 0px -80% 0px', // heading이 뷰포트 상단에 있을 때 활성 상태로 간주
          threshold: 0.1
        }
    );

    // 게시글 콘텐츠 영역의 heading 요소들만 관찰
    const headingElements = document.querySelector('[data-testid="post-content"]')?.querySelectorAll('h1, h2, h3, h4, h5, h6') || [];
    headingElements.forEach((element) => {
      headingRefs.current[element.id] = element;
      observer.observe(element);
    });

    // 컴포넌트 언마운트 시 관찰 해제
    return () => {
      headingElements.forEach((element) => {
        observer.unobserve(element);
      });
    };
  }, [headings]);

  // 목차 항목 클릭 시 해당 heading으로 스크롤
  const scrollToHeading = (id) => {
    const element = document.getElementById(id);
    if (element) {
      // 헤더 높이 또는 고정된 요소 고려 (필요 시 조정)
      const headerOffset = 80; // 대략적인 헤더 높이

      // 요소의 위치를 계산하고 헤더 높이를 고려하여 한 번에 스크롤
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  if (headings.length === 0) {
    return null;
  }

  return (
      <nav className={styles.tableOfContents}>
        <ul className={styles.tocList}>
          {headings.map((heading) => (
              <li
                  key={heading.id}
                  className={`${styles.tocItem} ${styles[`level${heading.level}`]} ${activeId === heading.id ? styles.active : ''}`}
              >
                <a
                    href={`#${heading.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToHeading(heading.id);
                    }}
                >
                  {heading.text}
                </a>
              </li>
          ))}
        </ul>
      </nav>
  );
};

export default TableOfContents;
