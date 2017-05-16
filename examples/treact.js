function isClass(type) {
  return (
  	Boolean(type.prototype) && Boolean(type.prototype.isReactElement)
  );
}

class CompositeComponent {
	constructor(element) {
    this.currentElement = element;
    this.renderedElement = null;
    this.publicInstance = null;
	}

  getPublicInstance() {
    return this.publicInstance;
  }

  getHostNode() {
  	return this.renderedComponent.getHostNode();
  }

	mount() {
		var element = this.currentElement;
		var type = element.type;
		var props = element.props || {};
		
		let renderedElement;
		if (isClass(type)) {
		  var publicInstance = new type();
      
		  if (publicInstance.componentWillMount) {
		    publicInstance.componentWillMount();
		  }
		  renderedElement = publicInstance.render();
		} else if (typeof type === 'function') {
			renderedElement = type(props);
		}
		this.publicInstance = publicInstance;

		var renderedComponent = instantiateComponent(renderedElement);
     
		this.renderedComponent = renderedComponent;
    Object.defineProperties(publicInstance, {
      '_reactInternalInstance': {
        value: this
      }
    });
		return renderedComponent.mount();
	}

  receive(nextElement) {
  	var prevProps = this.currentElement.props;
  	var publicInstance = this.publicInstance;
  	var prevRenderedComponent = this.renderedComponent;
  	var prevRenderedElement = prevRenderedComponent.currentElement;
    

  	this.currentElement = nextElement;
  	var type = nextElement.type;
  	var nextProps = nextElement.props;

  	var nextRenderedElement;
  	if (isClass(type)) {
      if (publicInstance.componentWillUpdate) {
        publicInstance.componentWillUpdate();
      }
      publicInstance.props = nextProps;
      nextRenderedElement = publicInstance.render();
  	} else if (typeof type === 'function') {
      nextRenderedElement = type(nextProps);
  	}

    if (prevRenderedElement.type === nextRenderedElement.type) {
      prevRenderedComponent.receive(nextRenderedElement);
      return
    }

    var prevNode = prevRenderedComponent.getHostNode();

    prevRenderedComponent.unmount();
    var nextRenderedComponent = nextRenderedElement;
    var nextNode = nextRenderedComponent.mount();

    this.renderedComponent = nextRenderedComponent;

    prevNode.parentNode.replaceChild(nextNode, prevNode);
  }

	unmount() {
		var publicInstance = this.publicInstance;
		if (publicInstance.componentWillUnMount) {
      publicInstance.componentWillUnMount();
		}
		var renderedComponent = this.renderedComponent;
		renderedComponent.unmount();
	}
}

class DOMComponent {
	constructor(element) {
    this.currentElement = element;
    this.renderedChildren = [];
    this.node = null;
	}
  
  getPublicInstance() {
  	return this.node;
  }

  getHostNode() {
  	return this.node;
  }

	mount () {
		var element = this.currentElement;
		var type = element.type;
		var props = element.props || {};
		var children = props.children || [];

		if (!Array.isArray(children)) {
		    children = [children];
	   }
     let node;
     if (['string', 'number'].includes(typeof element)) {
       node = document.createTextNode(element);
     } else {
       node = document.createElement(type);
  	   // Set the attributes
  	   Object.keys(props).forEach(propName => {
  	     if (propName !== 'children') {
  	       node.setAttribute(propName, props[propName]);
  	     }
  	   });
       
       children.filter(Boolean);
       var renderedChildren = children.map(instantiateComponent);
       this.renderedChildren = renderedChildren;
       var childNodes = renderedChildren.map(child => child.mount());
       childNodes.map((childNode) => node.appendChild(childNode));
     }
     this.node = node;
     return node;
	}

  receive(nextElement) {
  	var node = this.node;
  	var prevElement = this.currentElement;
  	var prevProps = prevElement.props || {};
  	var nextProps = nextElement.props || {};
  	this.currentElement = nextElement;
    
    Object.keys(prevProps).forEach(propName => {
    	if (propName !== 'children' && !nextProps.hasOwnProperty(propsName)) {
        node.setAttribute(propName);
    	}
    })

    Object.keys(nextProps).forEach(propName => {
      if (propName !== 'children') {
        node.setAttribute(propName, nextProps(propName));
      }
    });
    

    var prevChildren = prevProps.children || [];
    if (!Array.isArray(prevChildren)) {
      prevChildren = [prevChildren];
    }
    var nextChildren = nextProps.children || [];
    if (!Array.isArray(nextChildren)) {
      nextChildren = [nextChildren];
    }
    // These are arrays of internal instances:
    var prevRenderedChildren = this.renderedChildren;
    var nextRenderedChildren = [];

    // As we iterate over children, we will add operations to the array.
    var operationQueue = [];


    for (var i = 0; i < nextChildren.length; i++) {
      // Try to get an existing internal instance for this child
      var prevChild = prevRenderedChildren[i];

      // If there is no internal instance under this index,
      // a child has been appended to the end. Create a new
      // internal instance, mount it, and use its node.
      if (!prevChild) {
        var nextChild = instantiateComponent(nextChildren[i]);
        var node = nextChild.mount();

        // Record that we need to append a node
        operationQueue.push({type: 'ADD', node});
        nextRenderedChildren.push(nextChild);
        continue;
      }

      // We can only update the instance if its element's type matches.
      // For example, <Button size="small" /> can be updated to
      // <Button size="large" /> but not to an <App />.
      var canUpdate = prevChildren[i].type === nextChildren[i].type;

      // If we can't update an existing instance, we have to unmount it
      // and mount a new one instead of it.
      if (!canUpdate) {
        var prevNode = prevChild.node;
        prevChild.unmount();

        var nextChild = instantiateComponent(nextChildren[i]);
        var nextNode = nextChild.mount();

        // Record that we need to swap the nodes
        operationQueue.push({type: 'REPLACE', prevNode, nextNode});
        nextRenderedChildren.push(nextChild);
        continue;
      }

      // If we can update an existing internal instance,
      // just let it receive the next element and handle its own update.
      prevChild.receive(nextChildren[i]);
      nextRenderedChildren.push(prevChild);
    }

    // Finally, unmount any children that don't exist:
    for (var j = nextChildren.length; j < prevChildren.length; j++) {
     var prevChild = prevRenderedChildren[j];
     var node = prevChild.node;
     prevChild.unmount();

     // Record that we need to remove the node
     operationQueue.push({type: 'REMOVE', node});
    }

    // Point the list of rendered children to the updated version.
    this.renderedChildren = nextRenderedChildren;
    while (operationQueue.length > 0) {
       var operation = operationQueue.shift();
       switch (operation.type) {
       case 'ADD':
         this.node.appendChild(operation.node);
         break;
       case 'REPLACE':
         this.node.replaceChild(operation.nextNode, operation.prevNode);
         break;
       case 'REMOVE':
         this.node.removeChild(operation.node);
         break;
       }
    }   
  }

	unmount() {
		var renderedChildren = this.renderedChildren;
		renderedChildren.forEach(child => child.unmount());
	}
}

function instantiateComponent(element) {
	var type = element.type;
  if (typeof type === 'function') {
    return new CompositeComponent(element);
  } else {
    return new DOMComponent(element);
  }
}

function unmountTree(containerNode) {
	var node = containerNode.firstChild;
	var rootComponent = node._internalInstance;

	rootComponent.unmount();
	containerNode.innerHTML = '';
}

function mountTree(element, containerNode) {
	if (containerNode.firstChild) {
   
   var prevNode = containerNode.firstChild;
   var prevRootComponent = prevNode._internalInstance;
   var prevElement = prevRootComponent.currentElement;

   if (prevElement.type === element.type) {
     prevRootComponent.receive(element);
     return;
   }
    unmountTree(containerNode);
	}
	 var rootComponent = instantiateComponent(element);
	 var node = rootComponent.mount();
	 containerNode.appendChild(node);
	 node._internalInstance = rootComponent;
	 var publicInstance = rootComponent.getPublicInstance();
	 return publicInstance;
}

class Component {
  constructor(props) {
    this.props = props;
  }
  isReactElement() {
    return true;
  }
  setState(nextState) {
    const reactComponent = this._reactInternalInstance;
    this.state = Object.assign({}, this.state, nextState);
    if (reactComponent) {
      reactComponent.renderedComponent.receive(this.render())
    }
  }
}

window.React = {
  Component: Component
}
window.ReactDOM = {
  render: mountTree
}
