'use strict';

const Element = require('./Element');
const assert = require('./assert');
const HostComponent = require('./HostComponent');

function instantiateComponent(element) {
  assert(Element.isValidElement(element));

  let type = element.type;

  let wrapperInstance;
  if (typeof type === 'string') {
    wrapperInstance = HostComponent.construct(element);
  } else if (typeof type === 'function') {
    //其实也可以在这直接进行校验 因为都会需要一个 new的过程初次是可以的 但是第二次就可能会有问题
    wrapperInstance = new element.type(element.props);
    wrapperInstance._construct(element);
  } else if (typeof element === 'string' || typeof element === 'number') {
    wrapperInstance = HostComponent.constructTextComponent(element);
  }

  return wrapperInstance;

  // If we have a string type, create a wrapper
  // Otherwise we have a Component
  // return new element.type(element.props)
}

module.exports = instantiateComponent;
