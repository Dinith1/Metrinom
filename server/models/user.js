const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const findOrCreate = require("mongoose-findorcreate");

/**
 * @swagger
 *  components:
 *    schemas:
 *      User:
 *        type: object
 *        required:
 *          - spotifyUserId
 *          - displayName
 *          - friends
 *          - isPrivate
 *        properties:
 *          spotifyUserId:
 *            type: string
 *            description: User id that spotify generates
 *          displayName:
 *            type: string
 *            description: display name for spotify
 *          profilePic:
 *            type: string
 *            description: link to image of profile picture
 *          friends:
 *            type: string[]
 *            description: list of spotifyUserIds
 *          isPrivate:
 *            type: boolean
 *            description: if the user wants to show there profile information
 *          accessToken:
 *             type: string
 *          refreshToken:
 *             type: string
 *        example:
 *           spotifyUserId: 390FGD84JD
 *           displayName: Dinith
 *           profilePic: image.png
 *           friends: [Hong, Nisarag]
 *           isPrivate: false
 */
const userSchema = mongoose.Schema({
    spotifyUserId: {
        type: String,
        required: true,
        unique: true,
    },
    displayName: {
        type: String,
        required: true,
    },
    profilePic: {
        type: String,
        required: false,
    },
    friends: {
        type: [String],
        required: true,
        default: null,
    },
    isPrivate: {
        type: Boolean,
        require: true,
        default: false,
    },
    accessToken: String,
    refreshToken: String,
});

userSchema.statics.findAccessToken = async function (userId) {
    const user = await this.findOne({
        userId: new mongoose.Types.ObjectId(userId),
    });

    return user;
};

userSchema.plugin(uniqueValidator);
userSchema.plugin(findOrCreate);
module.exports = mongoose.model("User", userSchema);
