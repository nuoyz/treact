class App extends React.Component {
  constructor(props) {
    super(props);
  }
  componentWillMount() {
    this.setState({version: 0.1});
  }
  render () {
    const { version = 0 } = this.state;
    return {type: 'div', props: { children: {type: 'span', props: {children: `treact-${version}`}}}}
  }
}

var rootEl = document.getElementById('app');
ReactDOM.render({type: App}, rootEl);

ReactDOM.render({type: App}, rootEl);
