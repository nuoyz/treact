'use strict';

const React = require('../treact');
const PropTypes = require('prop-types');

class CounterButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {count: 0};
    this.timer = setInterval(() => {
      this.setState({count: this.state.count + 1});
    });
  }
  
  static defaultProps = {
    title: 'hello hello React Rally'
  }

  render() {
    if (this.state.count === 100) {
      clearInterval(this.timer);
    }
    return (
      <div>
        <h1>{this.props.title}</h1>
        <ColorSwatch color={333} number={this.state.count} />
        <div>Count: <span>{this.state.count}</span></div>
      </div>
    );
  }
}

class ColorSwatch extends React.Component {
  static propTypes = {
    color: PropTypes.string,
  };
  render() {
    const red = this.props.number % 256;
    return (
      <div
        style={{
          backgroundColor: `rgb(${red}, 0, 0)`,
          height: '50px',
          width: '50px',
        }}
      />
    );
  }
}

window.addEventListener('click', () => {
  React.render(
    <CounterButton />,
    document.getElementById('container'),
  );
});
