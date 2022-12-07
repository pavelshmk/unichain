import React from 'react';
import { Router, Switch, Route } from "react-router-dom";
import { RootStore } from "./stores";
import { ToastContainer } from "react-toastify";
import { Provider } from "inversify-react";
import { IndexPage } from "./pages/IndexPage";
import { CabinetPage } from "./pages/CabinetPage";
import { SignupPage } from "./pages/SignupPage";
import { Modals } from "./modals";

export const rootStore = new RootStore();
const container = rootStore.container

class Application extends React.Component {
    render() {
        return (
            <Provider container={container}>
                <Router history={rootStore.historyStore}>
                    <ToastContainer/>

                    <Switch>
                        <Route exact path='/' component={IndexPage} />
                        <Route path='/signup' component={SignupPage} />
                        <Route path='/cabinet' component={CabinetPage} />
                    </Switch>

                    <Modals />
                </Router>
            </Provider>
        );
    }
}

export default Application;
