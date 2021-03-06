const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();
const User = require("../models/user");
const LOGGER = require("../common/logger");
const spotify = require("../spotify-service");
const ensureAuthenticated = require("./ensureAuthenticated");

/**
 * @swagger
 *  components:
 *    schemas:
 *      Genres:
 *        type: object
 *        required:
 *        properties:
 *          genres:
 *             type: Array
 *        example:
 *           genres: [[pop,21],[rap,12]]
 */

/**
 * @swagger
 *  components:
 *    schemas:
 *      TrackURI:
 *        type: object
 *        required:
 *        properties:
 *          uris:
 *             type: Array
 *        example:
 *           uris: ["spotify:track:4iV5W9uYEdYUVa79Axb7Rh","spotify:track:1301WleyT98MSxVHPZCA6M"]
 */

/**
 * @swagger
 *  components:
 *    securitySchemes:
 *      ApiKeyAuth:
 *        type: apiKey
 *        in: header
 *        name: authorization
 *        description: spotify id of user
 */

/**
 * @swagger
 * path:
 *  /spotify/top/:
 *    get:
 *      security:
 *        - ApiKeyAuth: []
 *      tags: [Spotify]
 *      summary: Get top tracks or artists for the particular user
 *      parameters:
 *        - in: query
 *          name: type
 *          schema:
 *            type: string
 *          required: true
 *          description: Type of entity to return. Valid values = 'artists' or 'tracks'
 *        - in: query
 *          name: timeFrame
 *          schema:
 *            type: string
 *          required: false
 *          description: Optional. Valid values= long_term (calculated from several years of data and including all new data as it becomes available), medium_term (approximately last 6 months), short_term (approximately last 4 weeks). Default= medium_term
 *      responses:
 *        "200":
 *          description: An array items that contains artists or tracks ref= https://developer.spotify.com/documentation/web-api/reference/personalization/get-users-top-artists-and-tracks/
 */
router.get("/top", ensureAuthenticated, (req, res) => {
    const { authorization } = req.headers;
    const timeFrame = req.query.timeFrame || "medium_term";
    const { type } = req.query;

    // Retrieve the user in the database
    User.findOne({ spotifyUserId: authorization }, async (err, user) => {
        if (err || user == null) {
            LOGGER.error(err);
            res.status(400).json({ msg: "User was not found" });
        } else {
            const authToken = user.accessToken;
            const data = await spotify.fetchTopArtistOrTracks(type, timeFrame, authToken);
            if (data.error) {
                LOGGER.error(data.error);
                res.status(400).json(data.error);
            } else {
                LOGGER.info("GET Request Suceeded for /spotify/top/{id}");
                // LOGGER.info(data);
                res.status(200).json(data);
            }
        }
    });
});
/**
 * @swagger
 * path:
 *  /spotify/top/genres:
 *    get:
 *      security:
 *        - ApiKeyAuth: []
 *      tags: [Spotify]
 *      summary: Gets top genres for the particular user
 *      responses:
 *        "200":
 *          description: An array of genres in rankings from highest to lowest
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Genres'
 */
router.get("/top/genres", ensureAuthenticated, (req, res) => {
    req.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    const { authorization } = req.headers;
    const timeFrame = "medium_term";

    // Retrieve the user in the database
    User.findOne({ spotifyUserId: authorization }, async (err, user) => {
        if (err || user == null) {
            LOGGER.error(err);
            res.status(400).json({ msg: "error" });
        } else {
            const authToken = user.accessToken;
            const data = await spotify.fetchTopGenres(timeFrame, authToken);
            if (data.error) {
                LOGGER.error(data.error);
                res.status(400).json(data.error);
            } else {
                LOGGER.info("GET Request Suceeded for /spotify/top/genres/{id}");
                LOGGER.info(data);
                res.status(200).json(data);
            }
        }
    });
});

/**
 * @swagger
 * path:
 *  /spotify/recommendations:
 *    get:
 *      security:
 *        - ApiKeyAuth: []
 *      tags: [Spotify]
 *      summary: Get recommended tracks based on seeds
 *      parameters:
 *        - in: query
 *          name: seed_artist
 *          schema:
 *            type: string
 *          required: false
 *          description: A comma separated list of Spotify IDs for seed artists. Up to 5 seed values may be provided in any combination of seed_artists, seed_tracks and seed_genres.
 *        - in: query
 *          name: seed_tracks
 *          schema:
 *            type: string
 *          required: false
 *          description: A comma separated list of Spotify IDs for seed tracks. Up to 5 seed values may be provided in any combination of seed_artists, seed_tracks and seed_genres.
 *        - in: query
 *          name: seed_genres
 *          schema:
 *            type: string
 *          required: false
 *          description: A comma separated list of Spotify IDs for seed genres. Up to 5 seed values may be provided in any combination of seed_artists, seed_tracks and seed_genres.
 *      responses:
 *        "200":
 *          description: An array items that contains artists or tracks ref= https://developer.spotify.com/documentation/web-api/reference/browse/get-recommendations/
 */
router.get("/recommendations", ensureAuthenticated, (req, res) => {
    const seedArtist = req.query.seed_artist || "";
    const seedTracks = req.query.seed_tracks || "";
    const seedGenres = req.query.seed_genres || "";

    const { authorization } = req.headers;

    // Retrieve the user in the database
    User.findOne({ spotifyUserId: authorization }, async (err, user) => {
        if (err || user == null) {
            LOGGER.error(err);
            res.status(400).json({ msg: "error" });
        } else {
            const authToken = user.accessToken;
            const data = await spotify.fetchRecomendations(seedArtist, seedTracks, seedGenres, authToken);
            if (data.error) {
                LOGGER.error(data.error);
                res.status(400).json(data.error);
            } else {
                LOGGER.info("GET Request Suceeded for /spotify/recommendations/{id}");
                LOGGER.info(data);
                res.status(200).json(data);
            }
        }
    });
});
/**
 * @swagger
 * path:
 *  /spotify/playlist/create:
 *    post:
 *      security:
 *        - ApiKeyAuth: []
 *      tags: [Spotify]
 *      summary: Get recommended tracks based on seeds
 *      requestBody:
 *        required: true
 *        description: A JSON array of the Spotify track URIs to add.
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/TrackURI'
 *      responses:
 *        "200":
 *          description: A snapshot that shows the added tracks to playlist  ref= https://developer.spotify.com/documentation/web-api/reference/playlists/add-tracks-to-playlist/
 */
router.post("/playlist/create", ensureAuthenticated, (req, res) => {
    const { authorization } = req.headers;
    const songURIList = req.body.uris || "";
    // Retrieve the user in the database
    User.findOne({ spotifyUserId: authorization }, async (err, user) => {
        if (err || user == null) {
            LOGGER.error(err);
            res.status(400).json({ msg: "error" });
        } else {
            const authToken = user.accessToken;
            const data = await spotify.fetchMakePlaylist(songURIList, authorization, authToken);
            if (data.error) {
                LOGGER.error(data.error);
                res.status(400).json(data.error);
            } else {
                res.status(200).json(data);
            }
        }
    });
});

/**
 *
 */
router.post("/playlist/createFromGenres", ensureAuthenticated, (req, res) => {
    const { authorization } = req.headers;
    const { genre_seeds, target_danceability, target_energy, target_liveness, target_popularity, target_valence } = req.body;

    User.findOne({ spotifyUserId: authorization }, async (err, user) => {
        if (err || user == null) {
            LOGGER.error(err);
            res.status(400).json({ msg: "error" });
        } else {
            const authToken = user.accessToken;

            // Get recommended track URIs
            const trackUris = await spotify.fetchTrackRecommendationsFromGenresAndMetrics(
                genre_seeds,
                target_danceability,
                target_energy,
                target_liveness,
                target_popularity,
                target_valence,
                authToken,
            );

            // Create a playlist from the recommended tracks
            const playlist = await spotify.fetchMakePlaylist(trackUris, authorization, authToken);

            if (playlist.error) {
                LOGGER.error(playlist.error);
                res.status(400).json(playlist.error);
            } else {
                res.status(200).json(playlist);
            }
        }
    });
});

router.get("/recent-played", ensureAuthenticated, (req, res) => {
    const { authorization } = req.headers;
    User.findOne({ spotifyUserId: authorization }, async (err, user) => {
        if (err || user == null) {
            LOGGER.error(err);
            res.status(400).json({ msg: "error" });
        } else {
            const authToken = user.accessToken;
            const data = await spotify.fetchRecentTracks(authToken);
            if (data.error) {
                LOGGER.error(data.error);
                res.status(400).json(data.error);
            } else {
                res.status(200).json(data);
            }
        }
    });
});
/**
 * @swagger
 * path:
 *  /spotify/artist:
 *    get:
 *      security:
 *        - ApiKeyAuth: []
 *      tags: [Spotify]
 *      summary: Get artists
 *      parameters:
 *        - in: query
 *          name: artistId
 *          schema:
 *            type: string
 *          required: false
 *          description: The spotify id of the artist
 *      responses:
 *        "200":
 *          description: An artist item
 */
router.get("/artist", ensureAuthenticated, (req, res) => {
    const { authorization } = req.headers;
    const artistID = req.query.artistId;

    User.findOne({ spotifyUserId: authorization }, async (err, user) => {
        if (err || user == null) {
            LOGGER.error(err);
            res.status(400).json({ msg: "error" });
        } else {
            const authToken = user.accessToken;
            const data = await spotify.fetchArtist(authToken, artistID);
            if (data.error) {
                LOGGER.error(data.error);
                res.status(400).json(data.error);
            } else {
                res.status(200).json(data);
            }
        }
    });
});
/**
 * @swagger
 * path:
 *  /spotify/relatedArtist:
 *    get:
 *      security:
 *        - ApiKeyAuth: []
 *      tags: [Spotify]
 *      summary: Get similar artists
 *      parameters:
 *        - in: query
 *          name: artistId
 *          schema:
 *            type: string
 *          required: false
 *          description: The spotify id of the artist
 *      responses:
 *        "200":
 *          description: An array of artist items
 */
router.get("/relatedArtist", ensureAuthenticated, (req, res) => {
    const { authorization } = req.headers;
    const artistID = req.query.artistId;

    User.findOne({ spotifyUserId: authorization }, async (err, user) => {
        if (err || user == null) {
            LOGGER.error(err);
            res.status(400).json({ msg: "error" });
        } else {
            const authToken = user.accessToken;
            const data = await spotify.fetchRelatedArtist(authToken, artistID);
            if (data.error) {
                LOGGER.error(data.error);
                res.status(400).json(data.error);
            } else {
                res.status(200).json(data);
            }
        }
    });
});
/**
 * @swagger
 * path:
 *  /spotify/artist/follow:
 *    put:
 *      security:
 *        - ApiKeyAuth: []
 *      tags: [Spotify]
 *      summary: follows artist
 *      parameters:
 *        - in: query
 *          name: artistId
 *          schema:
 *            type: string
 *          required: false
 *          description: The spotify id of the artist
 *      responses:
 *        "204":
 *          description: no content
 */
router.put("/artist/follow", ensureAuthenticated, (req, res) => {
    const { authorization } = req.headers;
    const artistID = req.query.artistId;
    User.findOne({ spotifyUserId: authorization }, async (err, user) => {
        if (err || user == null) {
            LOGGER.error(err);
            res.status(400).json({ msg: "error" });
        } else {
            const authToken = user.accessToken;
            const response = await spotify.followArtist(authToken, artistID);
            LOGGER.info(response);
            if (response !== null && response !== undefined) {
                LOGGER.error(response);
                res.status(400).json(response);
            } else {
                res.status(204).json();
            }
        }
    });
});
/**
 * @swagger
 * path:
 *  /spotify/artist/unfollow:
 *    delete:
 *      security:
 *        - ApiKeyAuth: []
 *      tags: [Spotify]
 *      summary: unfollows artist
 *      parameters:
 *        - in: query
 *          name: artistId
 *          schema:
 *            type: string
 *          required: false
 *          description: The spotify id of the artist
 *      responses:
 *        "204":
 *          description: no content
 */
router.delete("/artist/unfollow", ensureAuthenticated, (req, res) => {
    const { authorization } = req.headers;
    const artistID = req.query.artistId;
    User.findOne({ spotifyUserId: authorization }, async (err, user) => {
        if (err || user == null) {
            LOGGER.error(err);
            res.status(400).json({ msg: "error" });
        } else {
            const authToken = user.accessToken;
            const response = await spotify.unFollowArtist(authToken, artistID);
            if (response !== null && response !== undefined) {
                LOGGER.error(response);
                res.status(400).json(response);
            } else {
                res.status(204).json();
            }
        }
    });
});
/**
 * @swagger
 * path:
 *  /spotify/isFollowing:
 *    get:
 *      security:
 *        - ApiKeyAuth: []
 *      tags: [Spotify]
 *      summary: check if user is following artist
 *      parameters:
 *        - in: query
 *          name: artistId
 *          schema:
 *            type: string
 *          required: false
 *          description: The spotify id of the artist
 *      responses:
 *        "204":
 *          description: no content
 */
router.get("/isFollowing", ensureAuthenticated, (req, res) => {
    const { authorization } = req.headers;
    const artistID = req.query.artistId;
    User.findOne({ spotifyUserId: authorization }, async (err, user) => {
        if (err || user == null) {
            LOGGER.error(err);
            res.status(400).json({ msg: "error" });
        } else {
            const authToken = user.accessToken;
            const data = await spotify.checkFollowing(authToken, artistID);
            if (data.error) {
                LOGGER.error(data.error);
                res.status(400).json(data.error);
            } else {
                res.status(200).json(data);
            }
        }
    });
});

router.get("/track", ensureAuthenticated, (req, res) => {
    const { authorization } = req.headers;
    const { trackId } = req.query;

    User.findOne({ spotifyUserId: authorization }, async (err, user) => {
        if (err || user == null) {
            LOGGER.error(err);
            res.status(400).json({ msg: "error" });
        } else {
            const authToken = user.accessToken;
            const data = await spotify.fetchTrack(authToken, trackId);
            if (data.error) {
                LOGGER.error(data.error);
                res.status(400).json(data.error);
            } else {
                res.status(200).json(data);
            }
        }
    });
});

router.get("/audio-features", ensureAuthenticated, (req, res) => {
    const { authorization } = req.headers;
    const { trackId } = req.query;

    User.findOne({ spotifyUserId: authorization }, async (err, user) => {
        if (err || user == null) {
            LOGGER.error(err);
            res.status(400).json({ msg: "error" });
        } else {
            const authToken = user.accessToken;
            const data = await spotify.fetchAudioFeatures(authToken, trackId);
            if (data.error) {
                LOGGER.error(data.error);
                res.status(400).json(data.error);
            } else {
                res.status(200).json(data);
            }
        }
    });
});

router.get("/artistGraph", ensureAuthenticated, (req, res) => {
    const { authorization } = req.headers;

    User.findOne({ spotifyUserId: authorization }, async (err, user) => {
        if (err || user == null) {
            LOGGER.error(err);
            res.status(400).json({ msg: "error" });
        } else {
            const authToken = user.accessToken;
            const data = await spotify.fetchGraph(authToken);
            if (data.error) {
                LOGGER.error(data.error);
                res.status(400).json(data.error);
            } else {
                res.status(200).json(data);
            }
        }
    });
});

module.exports = router;
