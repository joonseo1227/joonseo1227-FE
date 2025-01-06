import { Route, Routes} from "react-router-dom";
import withRouter from "../hooks/withRouter"
import { Home } from "../pages/home/Home.jsx";
import { Portfolio } from "../pages/portfolio/Portfolio.jsx";
import { ContactUs } from "../pages/contact/Contact.jsx";
import { About } from "../pages/about/About.jsx";
import { Socialicons } from "../components/socialicons/Socialicons.jsx";
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
            <Socialicons />
        </div>
    );
}

export default AppRoutes;
