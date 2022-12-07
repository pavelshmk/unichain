import React from 'react';
import { Link, Route } from "react-router-dom";

interface ICabinetNavLinkProps {
    to: string;
    exact?: boolean;
    children: React.ReactNode;
}

interface ICabinetNavLinkState {
}

export class CabinetNavLink extends React.Component<ICabinetNavLinkProps, ICabinetNavLinkState> {
    render() {
        const { to, exact, children } = this.props;

        return (
            <Route path={to} exact={exact} children={({ match }) => (
                <Link to={to} className={match && 'active'}>
                    {children}
                </Link>
            )} />
        )
    }
}