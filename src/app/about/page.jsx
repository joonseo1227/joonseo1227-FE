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

const about = {
    title: "About my self",
    aboutme: "사용자 중심의 경험 설계를 지향하는 프론트엔드 개발자 정준서입니다. 실제 서비스에서 요구되는 안정성, 확장성, 성능 최적화까지 고려한 개발을 지향하며, UI의 섬세함과 기능 구현의 완성도를 함께 추구합니다. ‘왜 이 인터페이스여야 하는가’를 끊임없이 고민하고, 협업을 통해 더 나은 제품을 만드는 것에 열정을 가지고 있습니다.",
};

const worktimeline = [
    {
        jobtitle: "AIIA",
        date: "2024 - 2025",
    },
    {
        jobtitle: "가천대학교",
        date: "2024 - NOW",
    },
    {
        jobtitle: "용인백현고등학교",
        date: "2021 - 2023",
    },
];

const techStack = {
    frontend: [
        {name: "Flutter", icon: SiFlutter},
        {name: "React", icon: SiReact},
        {name: "Next.js", icon: SiNextdotjs},
        {name: "HTML", icon: SiHtml5},
        {name: "CSS", icon: SiCss3}
    ],
    backend: [
        {name: "Supabase", icon: SiSupabase},
        {name: "Firebase", icon: SiFirebase}
    ],
    language: [
        {name: "C", icon: SiC},
        {name: "Python", icon: SiPython},
        {name: "Dart", icon: SiDart},
        {name: "Java", icon: FaJava},
        {name: "JavaScript", icon: SiJavascript}
    ],
    cicd: [
        {name: "Vercel", icon: SiVercel},
        {name: "GitHub Actions", icon: SiGithubactions}
    ],
    tools: [
        {name: "Git", icon: SiGit},
        {name: "GitHub", icon: SiGithub},
        {name: "Figma", icon: SiFigma},
        {name: "Notion", icon: SiNotion},
        {name: "Postman", icon: SiPostman},
        {name: "Slack", icon: SiSlack}
    ]
};

const certifications = [
    {
        name: "네트워크관리사 2급",
        organization: "한국정보통신자격협회(ICQA)"
    }
];

const services = [
    {
        title: "UI & UX Design",
        description: "사용자의 편리함과 직관적인 경험을 최우선으로, 감각적인 디자인과 혁신적인 UX를 만듭니다."
    },
    {
        title: "Mobile Apps",
        description: "다양한 플랫폼에서 완벽히 작동하는, 기능성과 디자인을 겸비한 모바일 앱을 개발합니다."
    },
    {
        title: "Web Design",
        description: "최신 트렌드와 기술을 반영하여, 사용자 친화적이고 반응형 웹 디자인을 완성합니다."
    }
];

export default function AboutPage() {
    // Common Intersection Observer options
    const observerOptions = {
        triggerOnce: true,
        threshold: 0.1,
        rootMargin: '-50px 0px -100px 0px', // Trigger earlier for smoother transitions
    };

    // Title section
    const [titleRef, titleInView] = useInView({
        ...observerOptions,
        threshold: 0.2, // Higher threshold for title to ensure it's more visible
    });

    // About section
    const [aboutRef, aboutInView] = useInView({
        ...observerOptions,
        delay: 100
    });

    // Work Timeline section
    const [timelineRef, timelineInView] = useInView({
        ...observerOptions,
        delay: 150
    });

    // Tech Stack section
    const [techStackRef, techStackInView] = useInView({
        ...observerOptions,
        delay: 200
    });

    // Services section
    const [servicesRef, servicesInView] = useInView({
        ...observerOptions,
        delay: 250
    });

    // Certifications section
    const [certRef, certInView] = useInView({
        ...observerOptions,
        delay: 300
    });

    return (
        <div className={styles.aboutPage}>
            <div
                ref={titleRef}
                className={`${styles.titleContainer} ${titleInView ? styles.animate : ''}`}
            >
                <h1 className="titleText">About</h1>
            </div>

            <div
                ref={aboutRef}
                className={`${styles.section} ${aboutInView ? styles.animate : ''}`}
            >
                <div className={styles.leftColumn}>
                    <h3 className={styles.subtitleText}>{about.title}</h3>
                </div>
                <div className={styles.rightColumn}>
                    <p className={styles.aboutMeText}>{about.aboutme}</p>
                </div>
            </div>

            <div
                ref={timelineRef}
                className={`${styles.section} ${timelineInView ? styles.animate : ''}`}
            >
                <div className={styles.leftColumn}>
                    <h3 className={styles.subtitleText}>Work Timeline</h3>
                </div>
                <div className={styles.rightColumn}>
                    <div className={styles.timelineContainer}>
                        {worktimeline.map((data, i) => (
                            <div className={styles.timelineItem} key={i} style={{animationDelay: `${i * 120 + 100}ms`}}>
                                <h5 className={styles.timelineTitle}>{data.jobtitle}</h5>
                                <p className={styles.timelineDate}>{data.date}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div
                ref={techStackRef}
                className={`${styles.section} ${techStackInView ? styles.animate : ''}`}
            >
                <div className={styles.leftColumn}>
                    <h3 className={styles.subtitleText}>Tech Stack</h3>
                </div>
                <div className={styles.rightColumn}>
                    <div className={styles.techStackContainer}>
                        <div className={styles.techCategory}>
                            <h4 className={styles.categoryTitle}>Frontend</h4>
                            <div className={styles.skillsGrid}>
                                {techStack.frontend.map((data, i) => (
                                    <div key={i} className={styles.skillContainer}
                                         style={{animationDelay: `${i * 80 + 100}ms`}}>
                                        <div className={styles.skillLogo}>
                                            {data.icon ? <data.icon className={styles.icon}/> :
                                                <div className={styles.icon}/>}
                                        </div>
                                        <h3 className={styles.skillsText}>{data.name}</h3>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={styles.techCategory}>
                            <h4 className={styles.categoryTitle}>Backend/BaaS</h4>
                            <div className={styles.skillsGrid}>
                                {techStack.backend.map((data, i) => (
                                    <div key={i} className={styles.skillContainer}
                                         style={{animationDelay: `${i * 80 + 150}ms`}}>
                                        <div className={styles.skillLogo}>
                                            {data.icon ? <data.icon className={styles.icon}/> :
                                                <div className={styles.icon}/>}
                                        </div>
                                        <h3 className={styles.skillsText}>{data.name}</h3>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={styles.techCategory}>
                            <h4 className={styles.categoryTitle}>Language</h4>
                            <div className={styles.skillsGrid}>
                                {techStack.language.map((data, i) => (
                                    <div key={i} className={styles.skillContainer}
                                         style={{animationDelay: `${i * 80 + 200}ms`}}>
                                        <div className={styles.skillLogo}>
                                            {data.icon ? <data.icon className={styles.icon}/> :
                                                <div className={styles.icon}/>}
                                        </div>
                                        <h3 className={styles.skillsText}>{data.name}</h3>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={styles.techCategory}>
                            <h4 className={styles.categoryTitle}>CI/CD</h4>
                            <div className={styles.skillsGrid}>
                                {techStack.cicd.map((data, i) => (
                                    <div key={i} className={styles.skillContainer}
                                         style={{animationDelay: `${i * 80 + 250}ms`}}>
                                        <div className={styles.skillLogo}>
                                            {data.icon ? <data.icon className={styles.icon}/> :
                                                <div className={styles.icon}/>}
                                        </div>
                                        <h3 className={styles.skillsText}>{data.name}</h3>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={styles.techCategory}>
                            <h4 className={styles.categoryTitle}>Tools</h4>
                            <div className={styles.skillsGrid}>
                                {techStack.tools.map((data, i) => (
                                    <div key={i} className={styles.skillContainer}
                                         style={{animationDelay: `${i * 80 + 300}ms`}}>
                                        <div className={styles.skillLogo}>
                                            {data.icon ? <data.icon className={styles.icon}/> :
                                                <div className={styles.icon}/>}
                                        </div>
                                        <h3 className={styles.skillsText}>{data.name}</h3>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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
                            <div className={styles.service} key={i} style={{animationDelay: `${i * 120 + 100}ms`}}>
                                <h5 className={styles.serviceTitle}>{data.title}</h5>
                                <p className={styles.serviceDesc}>{data.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

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
                            <div className={styles.certification} key={i}
                                 style={{animationDelay: `${i * 120 + 100}ms`}}>
                                <h5 className={styles.certificationTitle}>{cert.name}</h5>
                                <p className={styles.certificationOrg}>{cert.organization}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
