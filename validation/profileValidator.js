const { body } = require('express-validator');

const createProfileValidation = [
  body('affiliation').notEmpty().withMessage('Affiliation is required'),
  body('designation').notEmpty().withMessage('Designation is required'),
  body('bio').notEmpty().withMessage('Bio is required'),
  body('fieldOfResearch')
    .isArray({ min: 1 })
    .withMessage('Field of Research must be a non-empty array'),
  body('publications')
    .optional()
    .isArray()
    .withMessage('Publications must be an array if provided')
    .custom((arr) => {
      for (const pub of arr) {
        if (!pub.title || !pub.link || !pub.year) {
          throw new Error(
            'Each publication must have title, link, and year fields'
          );
        }
      }
      return true;
    }),
  body('awards')
    .optional()
    .isArray()
    .withMessage('Awards must be an array if provided')
    .custom((arr) => {
      for (const award of arr) {
        if (!award.title || !award.year) {
          throw new Error('Each award must have title and year fields');
        }
      }
      return true;
    }),
  body('socialLinks.linkedIn')
    .optional()
    .isURL()
    .withMessage('Invalid LinkedIn URL format'),
  body('socialLinks.researchGate')
    .optional()
    .isURL()
    .withMessage('Invalid ResearchGate URL format'),
  body('socialLinks.orcid')
    .optional()
    .isURL()
    .withMessage('Invalid ORCID URL format'),
];

module.exports = createProfileValidation;
