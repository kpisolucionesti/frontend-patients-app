import React from "react";
import { Route } from "react-router";

export const PrivateRoute = ({component: Component, ...rest }) => {
    return <Route {...rest} />
}

export const PublicRoute = ({component: Component, ...rest}) => {
    return <Route {...rest} />
}