'use strict';

const invariant = require('./utils/invariant');
const warning = require('./utils/warning');

const ReactPropTypeLocationNames = {
  prop: 'prop',
  context: 'context',
  childContext: 'child context',
};
const ReactPropTypesSecret = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';


var loggedTypeFailures = {};

/**
 * Assert that the values match with the type specs.
 * Error messages are memorized and will only be shown once.
 *
 * @param {object} typeSpecs Map of name to a ReactPropType
 * @param {object} values Runtime values that need to be type-checked
 * @param {string} location e.g. "prop", "context", "child context"
 * @param {string} componentName Name of the component for error messages.
 * @param {?object} element The React element that is being type-checked
 * @param {?number} workInProgressOrDebugID The React component instance that is being type-checked
 * @private
 */
function checkReactTypeSpec(
  typeSpecs,
  values,
  location,
  componentName,
  element,
  // It is only safe to pass fiber if it is the work-in-progress version, and
  // only during reconciliation (begin and complete phase).
  workInProgressOrDebugID,
) {
  for (var typeSpecName in typeSpecs) {
    if (typeSpecs.hasOwnProperty(typeSpecName)) {
      var error;
      // Prop type validation may throw. In case they do, we don't want to
      // fail the render phase where it didn't fail before. So we log it.
      // After these have been cleaned up, we'll let them throw.
      try {
        // This is intentionally an invariant that gets caught. It's the same
        // behavior as without this statement except with a better message.
        invariant(
          typeof typeSpecs[typeSpecName] === 'function',
          '%s: %s type `%s` is invalid; it must be a function, usually from ' +
          'React.PropTypes.',
          componentName || 'React class',
          ReactPropTypeLocationNames[location],
          typeSpecName
        );
        error = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, ReactPropTypesSecret);
      } catch (ex) {
        error = ex;
      }
      warning(
        !error || error instanceof Error,
        '%s: type specification of %s `%s` is invalid; the type checker ' +
        'function must return `null` or an `Error` but returned a %s. ' +
        'You may have forgotten to pass an argument to the type checker ' +
        'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' +
        'shape all require an argument).',
        componentName || 'React class',
        ReactPropTypeLocationNames[location],
        typeSpecName,
        typeof error
      );
      if (error instanceof Error && !(error.message in loggedTypeFailures)) {
        // Only monitor this failure once because there tends to be a lot of the
        // same error.
        loggedTypeFailures[error.message] = true;

        warning(
          false,
          'Failed %s type: %s%s',
          location,
          error.message,
        );
      }
    }
  }
}

module.exports = checkReactTypeSpec;
