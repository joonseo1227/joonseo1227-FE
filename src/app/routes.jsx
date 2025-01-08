import { Route, Routes} from "react-router-dom";
import withRouter from "../hooks/withRouter"
import { Home } from "../pages/Home/Home.jsx";
import { Portfolio } from "../pages/Portfolio/Portfolio.jsx";
import { ContactUs } from "../pages/Contact/Contact.jsx";
import { About } from "../pages/About/About.jsx";
import { SocialIcons } from "../components/SocialIcons/SocialIcons.jsx";
import { CSSTransition, TransitionGroup } from "react-transition-group";

const AnimatedRoutes = withRouter(({ location }) => (
    <TransitionGroup>
        <CSSTransition
            key={location.key}
            timeout={{
                enter: 400,
                exit: 400,
            }}
            classNames="page"
            unmountOnExit
        >
            <Routes location={location}>
                <Route exact path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="*" element={<Home />} />
            </Routes>
        </CSSTransition>
    </TransitionGroup>
));

function AppRoutes() {
    return (
        <div className="s_c">
            <AnimatedRoutes />
            <SocialIcons />
        </div>
    );
}

export default AppRoutes;
