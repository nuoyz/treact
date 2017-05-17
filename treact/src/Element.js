'use strict';
const checkReactTypeSpec = require('./checkReactTypeSpec');
function createElement(type, config, children) {
  // Clone the passed in config (props). In React we move some special
  // props off of this object (keys, refs).
  let props = Object.assign({}, config);
 
  
  // Build props.children. We'll make it an array if we have more than 1.
  let childCount = arguments.length - 2;
  if (childCount === 1) {
    props.children = children;
  } else if (childCount > 1) {
    props.children = Array.prototype.slice.call(arguments, 2);
  }

  // React Features not supported:
  // - keys
  // - refs
  // - defaultProps (usually set here) //ok
  if (type.defaultProps && typeof type.defaultProps === 'object'
    && Object.keys(type.defaultProps).length > 0) {
    Object.keys(type.defaultProps).forEach(propKey => {
      if (!props[propKey]) {
        props[propKey] = type.defaultProps[propKey]
      }
    });
  }
  validatePropTypes( {type, props, });
  return {
    type,
    props,
  };
}

function isValidElement(element) {
  let typeofElement = typeof element;
  let typeofType = element.type && typeof element.type;
  return (
    typeofElement === 'string' ||
    typeofElement === 'number' ||
    typeofType === 'string' ||
    (typeofType === 'function' && element.type.isDilithiumClass)
  );
}

function validatePropTypes(element) {
  var componentClass = element.type;
  if (typeof componentClass !== 'function') {
    return;
  }
  var name = componentClass.displayName || componentClass.name;
  if (componentClass.propTypes) {
    checkReactTypeSpec(
      componentClass.propTypes,
      element.props,
      'prop',
      name,
      element,
      null
    );
  }
}

module.exports = {
  createElement,
  isValidElement,
};
