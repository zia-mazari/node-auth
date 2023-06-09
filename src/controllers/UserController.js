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
        try {
            const passwordResponse = await userService.updatePassword(req.tokenPayload.user.id, value.currentPassword, value.newPassword);
            if (passwordResponse.success) {
                return res.status(httpStatus.OK).json({success: true, message: passwordResponse.message});
            } else {
                return res.status(httpStatus.BAD_REQUEST).json({success: false, message: passwordResponse.message});
            }
        } catch (exc){
            return res.status(httpStatus.BAD_REQUEST).json({success: false, message: exc.message});
        }
    } catch (exc) {
        return res.status(httpStatus.UNAUTHORIZED).json({success: false, message: exc.message});
    }
}