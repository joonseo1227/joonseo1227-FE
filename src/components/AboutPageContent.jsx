'use client';
import React from 'react';
import styles from '@/styles/pages/AboutPage.module.css';
import {
    SiC,
    SiCss3,
    SiDart,
    SiFigma,
    SiFirebase,
    SiFlutter,
    SiGit,
    SiGithub,
    SiGithubactions,
    SiHtml5,
    SiJavascript,
    SiNextdotjs,
    SiNotion,
    SiPostman,
    SiPython,
    SiReact,
    SiSlack,
    SiSupabase,
    SiVercel
} from 'react-icons/si';
import {FaJava} from "react-icons/fa";
import {useInView} from 'react-intersection-observer';

// 아이콘 매핑 객체
const iconMap = {
    SiFlutter: SiFlutter,
    SiReact: SiReact,
    SiNextdotjs: SiNextdotjs,
    SiHtml5: SiHtml5,
    SiCss3: SiCss3,
    SiSupabase: SiSupabase,
    SiFirebase: SiFirebase,
    SiC: SiC,
    SiPython: SiPython,
    SiDart: SiDart,
    FaJava: FaJava,
    SiJavascript: SiJavascript,
    SiVercel: SiVercel,
    SiGithubactions: SiGithubactions,
    SiGit: SiGit,
    SiGithub: SiGithub,
    SiFigma: SiFigma,
    SiNotion: SiNotion,
    SiPostman: SiPostman,
    SiSlack: SiSlack
};

export default function AboutPageContent({
                                             aboutInfo,
                                             workTimeline,
                                             techStack,
                                             services,
                                             certifications
                                         }) {
    // Common Intersection Observer options
    const observerOptions = {
        triggerOnce: true,
        threshold: 0.1,
        rootMargin: '-50px 0px -100px 0px',
    };

    // InView 훅들
    const [titleRef, titleInView] = useInView({
        ...observerOptions,
        threshold: 0.2,
    });

    const [aboutRef, aboutInView] = useInView({
        ...observerOptions,
        delay: 100
    });

    const [timelineRef, timelineInView] = useInView({
        ...observerOptions,
        delay: 150
    });

    const [techStackRef, techStackInView] = useInView({
        ...observerOptions,
        delay: 200
    });

    const [servicesRef, servicesInView] = useInView({
        ...observerOptions,
        delay: 250
    });

    const [certRef, certInView] = useInView({
        ...observerOptions,
        delay: 300
    });

    // Tech Stack 데이터를 아이콘과 함께 처리
    const processedTechStack = {};
    Object.entries(techStack).forEach(([key, category]) => {
        const skills = category.skills.map(skill => ({
            name: skill.name,
            icon: iconMap[skill.icon_name] || null
        }));

        processedTechStack[key] = {
            displayName: category.display_name,
            skills: skills
        };
    });

    return (
        <div className={styles.aboutPage}>
            <div
                ref={titleRef}
                className={`${styles.titleContainer} ${titleInView ? styles.animate : ''}`}
            >
                <h1 className="titleText">About</h1>
            </div>

            {/* About 섹션 */}
            {aboutInfo && (
                <div
                    ref={aboutRef}
                    className={`${styles.section} ${aboutInView ? styles.animate : ''}`}
                >
                    <div className={styles.leftColumn}>
                        <h3 className={styles.subtitleText}>{aboutInfo.title}</h3>
                    </div>
                    <div className={styles.rightColumn}>
                        <p className={styles.aboutMeText}>{aboutInfo.description}</p>
                    </div>
                </div>
            )}

            {/* Work Timeline 섹션 */}
            {workTimeline.length > 0 && (
                <div
                    ref={timelineRef}
                    className={`${styles.section} ${timelineInView ? styles.animate : ''}`}
                >
                    <div className={styles.leftColumn}>
                        <h3 className={styles.subtitleText}>Work Timeline</h3>
                    </div>
                    <div className={styles.rightColumn}>
                        <div className={styles.timelineContainer}>
                            {workTimeline.map((data, i) => (
                                <div className={styles.timelineItem} key={data.id}
                                     style={{animationDelay: `${i * 120 + 100}ms`}}>
                                    <h5 className={styles.timelineTitle}>{data.job_title}</h5>
                                    <p className={styles.timelineDate}>{data.date_range}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Tech Stack 섹션 */}
            {Object.keys(processedTechStack).length > 0 && (
                <div
                    ref={techStackRef}
                    className={`${styles.section} ${techStackInView ? styles.animate : ''}`}
                >
                    <div className={styles.leftColumn}>
                        <h3 className={styles.subtitleText}>Tech Stack</h3>
                    </div>
                    <div className={styles.rightColumn}>
                        <div className={styles.techStackContainer}>
                            {Object.entries(processedTechStack).map(([key, category]) => (
                                <div key={key} className={styles.techCategory}>
                                    <h4 className={styles.categoryTitle}>{category.displayName}</h4>
                                    <div className={styles.skillsGrid}>
                                        {category.skills.map((skill, i) => (
                                            <div key={i} className={styles.skillContainer}
                                                 style={{animationDelay: `${i * 80 + 100}ms`}}>
                                                <div className={styles.skillLogo}>
                                                    {skill.icon ? <skill.icon className={styles.icon}/> :
                                                        <div className={styles.icon}/>}
                                                </div>
                                                <h3 className={styles.skillsText}>{skill.name}</h3>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Services 섹션 */}
            {services.length > 0 && (
                <div
                    ref={servicesRef}
                    className={`${styles.section} ${servicesInView ? styles.animate : ''}`}
                >
                    <div className={styles.leftColumn}>
                        <h3 className={styles.subtitleText}>Services</h3>
                    </div>
                    <div className={styles.rightColumn}>
                        <div className={styles.servicesContainer}>
                            {services.map((data, i) => (
                                <div className={styles.service} key={data.id}
                                     style={{animationDelay: `${i * 120 + 100}ms`}}>
                                    <h5 className={styles.serviceTitle}>{data.title}</h5>
                                    <p className={styles.serviceDesc}>{data.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Certifications 섹션 */}
            {certifications.length > 0 && (
                <div
                    ref={certRef}
                    className={`${styles.section} ${certInView ? styles.animate : ''}`}
                >
                    <div className={styles.leftColumn}>
                        <h3 className={styles.subtitleText}>Certifications</h3>
                    </div>
                    <div className={styles.rightColumn}>
                        <div className={styles.certificationsContainer}>
                            {certifications.map((cert, i) => (
                                <div className={styles.certification} key={cert.id}
                                     style={{animationDelay: `${i * 120 + 100}ms`}}>
                                    <h5 className={styles.certificationTitle}>{cert.name}</h5>
                                    <p className={styles.certificationOrg}>{cert.organization}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 