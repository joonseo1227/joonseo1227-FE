import imgSrc from '../public/images/IMG_6434.jpg';

const logotext = "joonseo1227";

const meta = {
    title: "joonseo1227",
    description: "디자인과 기술의 조화를 추구하는 프론트엔드 개발자입니다. UI/UX를 기반으로 사용자 중심의 경험을 창조합니다.",
};

const introdata = {
    title: "안녕하세요. 정준서입니다.",
    animated: {
        first: "코드를 디자인하고,<br/>경험을 창조합니다.",
        second: "디자인과 개발의 조화를<br/>추구합니다.",
        third: "작은 디테일로<br/>큰 가치를 만듭니다.",
    },
    description: "디자인과 기술의 조화를 추구하는 프론트엔드 개발자입니다.\nUI/UX를 기반으로 사용자 중심의 경험을 창조합니다.",
    your_img_url: imgSrc,
};

const dataabout = {
    title: "About my self",
    aboutme: "디자인과 기술의 조화를 추구하는 프론트엔드 개발자입니다. UI/UX를 기반으로 사용자 중심의 경험을 창조합니다.",
};

const worktimeline = [
    {
        jobtitle: "AIIA",
        where: "경기도 성남",
        date: "2024 - 현재",
    },
    {
        jobtitle: "가천대학교",
        where: "경기도 성남",
        date: "2024 - 현재",
    },
    {
        jobtitle: "용인백현고등학교",
        where: "경기도 용인",
        date: "2021 - 2023",
    },
];

const skills = [
    {
        name: "Flutter",
        value: 90,
    },
    {
        name: "Figma",
        value: 90,
    },
    {
        name: "C",
        value: 85,
    },
    {
        name: "Python",
        value: 80,
    },
    {
        name: "React",
        value: 60,
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

const dataportfolio = [
    {
        img: "../public/images/ChallengeOne.jpg",
        description: "목표 성취 플랫폼",
        link: "https://github.com/joonseo1227/challengeone",
    },
    {
        img: "https://picsum.photos/400/500/?grayscale",
        description: "",
        link: "",
    },
    {
        img: "https://picsum.photos/400/200/?grayscale",
        description: "",
        link: "",
    },
    {
        img: "../public/images/MetaGachon.jpg",
        description: "가천대학교 AI·소프트웨어학부 통합 예약 시스템",
        link: "",
    },
    {
        img: "https://picsum.photos/400/400/?grayscale",
        description: "",
        link: "",
    },
    {
        img: "https://picsum.photos/400/600/?grayscale",
        description: "",
        link: "",
    },
    {
        img: "../public/images/FilmChoice.jpg",
        description: "영화 정보 웹사이트",
        link: "https://github.com/joonseo1227/filmchoice",
    },
];

const contactConfig = {
    YOUR_EMAIL: "joonseo1227@gmail.com",
    //YOUR_FONE: "",
    // description: "",
    // creat an emailjs.com account
    // check out this tutorial https://www.emailjs.com/docs/examples/reactjs/
    YOUR_SERVICE_ID: "service_id",
    YOUR_TEMPLATE_ID: "template_id",
    YOUR_USER_ID: "user_id",
};

const socialprofils = {
    github: "https://github.com/joonseo1227",
    instagram: "https://www.instagram.com/joonseo1227/",
    linkedin: "https://www.linkedin.com/in/joonseo1227/",
    youtube: "https://www.youtube.com/@nulll0512/featured",
};

export {
    meta,
    dataabout,
    dataportfolio,
    worktimeline,
    skills,
    services,
    introdata,
    contactConfig,
    socialprofils,
    logotext,
};