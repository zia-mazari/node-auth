const {updatePasswordSchema, updateNameSchema} = require('../utils/validations/userValidations');
const userService = require('../services/UserService');
const httpStatus = require('http-status');


exports.updatePassword = async (req, res) => {
    try {
        // Validation
        const {error, value} = updatePasswordSchema.validate(req.body);
        if (error) {
            return res.status(httpStatus.BAD_REQUEST).json({error: error.details});
        }
        const isUpdated = await userService.updatePassword(req.tokenPayload.user.id, value.currentPassword, value.newPassword);
        if (isUpdated) {
            return res.status(httpStatus.OK).json({success: true, message: 'Password updated.'});
        }
    } catch (exc) {
        return res.status(httpStatus.UNAUTHORIZED).json({success: false, message: exc.message});
    }
}