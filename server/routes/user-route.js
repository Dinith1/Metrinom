const express = require("express");
const router = express.Router();
const User = require("../models/user");
const LOGGER = require("../common/logger");
// GET Single user
/**
 * @swagger
 * path:
 *  /user/{id}:
 *    get:
 *      tags: [Users]
 *      summary: Get a user by spotify id
 *      parameters:
 *        - in: path
 *          name: id
 *          schema:
 *            type: string
 *          required: true
 *          description: Id of the user
 *      responses:
 *        "200":
 *          description: An array of users object
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/User'
 *
 */
router.get("/:id", (req, res) => {
    User.findOne({ spotifyUserId: req.params.id }, (err, users) => {
        if (err) {
            LOGGER.error(err);
            res.status(400).json({ msg: "User was not found" });
        } else {
            LOGGER.info("GET Request Suceeded for /user/{id}");
            LOGGER.info(users);
            res.status(200).json(users);
        }
    });
});

// Updates a users information
/**
 * @swagger
 * path:
 *  /user/:
 *    put:
 *      tags: [Users]
 *      summary: Updates a user
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *      responses:
 *        "200":
 *          description: A user schema
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/User'
 */
router.put("/", (req, res) => {
    User.findOneAndUpdate({ spotifyUserId: req.body.spotifyUserId }, req.body, { upsert: "true" }, (err, user) => {
        if (err) {
            LOGGER.error(err);
            res.status(400).json({ msg: "User was not found" });
        } else {
            LOGGER.info("PUT Request Suceeded for /user/");
            res.status(200).json(user);
        }
    });
});

module.exports = router;
