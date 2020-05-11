import React from "react";
import { Route, Switch, withRouter } from "react-router-dom";
import HomePage from "./components/HomePage";
import ProfilePage from "./components/ProfilePage";
import RedirectPage from "./components/RedirectPage";
import { ArtistStats, GenreStats, TrackStats } from "./components/stats";
import PrivateRoute from "./utils/routes/PrivateRoute";

const App = () => {
    return (
        <div>
            <Switch>
                <Route exact path="/login/redirect/:token" component={RedirectPage} />
                <PrivateRoute exact path="/" component={HomePage} />
                <PrivateRoute exact path="/genres" component={GenreStats} />
                <PrivateRoute exact path="/artists" component={ArtistStats} />
                <PrivateRoute exact path="/tracks" component={TrackStats} />
                <PrivateRoute exact path="/profile/:user" component={ProfilePage} />
            </Switch>
        </div>
    );
};

export default withRouter(App);
