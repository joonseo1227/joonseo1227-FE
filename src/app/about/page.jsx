import styles from '@/styles/pages/AboutPage.module.css';

const about = {
    title: "About my self",
    aboutme: "사용자 중심의 경험 설계를 지향하는 프론트엔드 개발자 정준서입니다. 실제 서비스에서 요구되는 안정성, 확장성, 성능 최적화까지 고려한 개발을 지향하며, UI의 섬세함과 기능 구현의 완성도를 함께 추구합니다. ‘왜 이 인터페이스여야 하는가’를 끊임없이 고민하고, 협업을 통해 더 나은 제품을 만드는 것에 열정을 가지고 있습니다.",
};

const worktimeline = [
    {
        jobtitle: "AIIA",
        date: "2024 - NOW",
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

const skills = [
    {
        name: "Flutter",
    },
    {
        name: "Figma",
    },
    {
        name: "Git",
    },
    {
        name: "C",
    },
    {
        name: "Python",
    },
    {
        name: "React",
    },
    {
        name: "Next.js",
    },
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
    return (
        <div className={styles.aboutPage}>
            <h1 className="titleText">About</h1>

            <div className={styles.section}>
                <div className={styles.leftColumn}>
                    <h3 className={styles.subtitleText}>{about.title}</h3>
                </div>
                <div className={styles.rightColumn}>
                    <p className={styles.aboutMeText}>{about.aboutme}</p>
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.leftColumn}>
                    <h3 className={styles.subtitleText}>Work Timeline</h3>
                </div>
                <div className={styles.rightColumn}>
                    <table className={styles.table}>
                        <tbody>
                        {worktimeline.map((data, i) => (
                            <tr key={i}>
                                <th>{data.jobtitle}</th>
                                <td>{data.date}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.leftColumn}>
                    <h3 className={styles.subtitleText}>Skills</h3>
                </div>
                <div className={styles.rightColumn}>
                    {skills.map((data, i) => (
                        <div key={i} className={styles.skillContainer}>
                            <h3 className={styles.skillsText}>{data.name}</h3>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.leftColumn}>
                    <h3 className={styles.subtitleText}>Services</h3>
                </div>
                <div className={styles.rightColumn}>
                    {services.map((data, i) => (
                        <div className={styles.service} key={i}>
                            <h5 className={styles.serviceTitle}>{data.title}</h5>
                            <p className={styles.serviceDesc}>{data.description}</p>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
