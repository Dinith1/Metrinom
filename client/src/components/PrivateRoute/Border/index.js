import { Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import HistoryIcon from "@material-ui/icons/History";
import HomeIcon from "@material-ui/icons/Home";
import MusicNoteIcon from "@material-ui/icons/MusicNote";
import PersonIcon from "@material-ui/icons/Person";
import AlbumIcon from "@material-ui/icons/Album";
import TimelineIcon from "@material-ui/icons/Timeline";
import React, { useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLastLocation } from "react-router-last-location";
import { MetrinomContext } from "../../../context/MetrinomContext";
import MusicLoader from "../../Loaders/MusicLoader";
import HeaderBar from "./HeaderBar";
import SideDrawer from "./SideDrawer";

const useStyles = makeStyles((theme) => ({
    root: {
        display: "flex",
    },
    toolbar: theme.mixins.toolbar,
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
    },
    loader: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "80vh",
    },
}));

const routes = [
    { name: "Home", path: "/", icon: <HomeIcon /> },
    { name: "Top Genres", path: "/genres", icon: <AlbumIcon /> },
    { name: "Top Artists", path: "/artists", icon: <PersonIcon /> },
    { name: "Top Artists Graph", path: "/artists-graph", icon: <TimelineIcon /> },
    { name: "Top Tracks", path: "/tracks", icon: <MusicNoteIcon /> },
    { name: "Recently Played", path: "/recent", icon: <HistoryIcon /> },
];

const Border = ({ children }) => {
    const { isLoading, setIsLoading } = useContext(MetrinomContext);

    const location = useLocation();
    const lastLocation = useLastLocation();
    const classes = useStyles();

    useEffect(() => {
        if (!lastLocation || lastLocation.pathname !== location.pathname) {
            setIsLoading(true);
        }
    }, [setIsLoading, lastLocation, location]);

    return (
        <div className={classes.root}>
            <HeaderBar />
            <SideDrawer routes={routes} />
            <main className={classes.content}>
                <div className={classes.toolbar} />
                {isLoading && (
                    <Box className={classes.loader}>
                        <MusicLoader />
                    </Box>
                )}
                {children}
            </main>
        </div>
    );
};

export default Border;
