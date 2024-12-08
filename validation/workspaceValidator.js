const { body, validationResult } = require('express-validator');

const workspaceValidator = [
    body('title')
        .isString().withMessage('Title must be a string')
        .notEmpty().withMessage('Title must be a non-empty string'),

    body('overview')
        .isString().withMessage('Overview must be a string')
        .notEmpty().withMessage('Overview must be a non-empty string'),

    body('roles')
        .isArray({ min: 1 }).withMessage('Roles must be a non-empty array')
        .custom((roles) => {
            for (const role of roles) {
                if (typeof role !== 'string' || role.trim() === '') {
                    throw new Error('Each role must be a non-empty string');
                }
            }
            return true;
        }),

    body('mode')
        .isIn(['Public', 'Invite-Only']).withMessage('Mode must be one of the following: Public, Invite-Only')
];

module.exports = workspaceValidator;
