var Button = ReactBootstrap.Button;
var ButtonToolbar = ReactBootstrap.ButtonToolbar;

var Box = React.createClass({
	getInitialState() {
		return {
			x: this.props.x,
			y: this.props.y,
			alive: this.props.alive
		}
	},

	componentWillReceiveProps: function(nextProps) {
		this.setState({
			alive: nextProps.alive
		})
	},

	toggle: function() {
		this.props.toggle(this.state.x, this.state.y);
	},

	render: function() {
		return (
			<td onClick = { this.toggle } 
				onDragEnter = { this.toggle }
				x = { this.state.x } 
				y = { this.state.y } 
				className = { this.state.alive ? 'alive' : 'dead' } />
		)
	}
});

var Row = React.createClass({
	getInitialState() {
		return {
			x: this.props.x
		}
	},

	render: function() {
		var boxes = [];
		var data = this.props.data;

		for (var i = 0; i < data.length; i++) {
			boxes.push(<Box x = { this.state.x } 
							y = { i } 
							alive = { data[i] } 
							toggle = {this.props.toggle}
							key = { i } />)
		}

		return (
			<tr>
				{ boxes }
			</tr>
		)
	}
});

var Page = React.createClass({
	getInitialState() {
		return {
			generation: 0,
			data: this.props.data,
			numRows: this.props.numRows,
			numColumns: this.props.numColumns,
			going: false
		}
	},

	toggle: function(x, y) {
		var data = this.state.data;
		data[x][y] = !data[x][y]
		this.setState({ data: data })
	},

	nextGeneration: function() {
		var data = this.state.data
		var clean = this.clearData();

		for ( var x = 0; x < data.length; x++ ) {
			
			if (x === 0) {
				var rowBefore = data.length-1;
				var rowAfter = x + 1;
			} else if (x === data.length-1) {
				var rowBefore = x - 1;
				var rowAfter = 0;
			} else {
				var rowBefore = x - 1;
				var rowAfter = x + 1;
			}

			for ( var y = 0; y < data[x].length; y++ ) {
				var isAlive = data[x][y], neighbors = [];

				if (y === 0) {
					var colBefore = data[x].length-1;
					var colAfter = y + 1;
				} else if (y === data[x].length-1) {
					var colBefore = y - 1;
					var colAfter = 0;
				} else {
					var colBefore = y - 1;
					var colAfter = y + 1;
				}

				neighbors.push(data[rowBefore][colBefore], data[rowBefore][y], data[rowBefore][colAfter])
				neighbors.push(data[x][colBefore], data[x][colAfter])
				neighbors.push(data[rowAfter][colBefore], data[rowAfter][y], data[rowAfter][colAfter])
				
				var livingNeighbors = 0;
				neighbors.map(function(value) {
					if (value) { livingNeighbors += 1 }
				})

				// RULES
				// alive with less than 2 neighbors = dead
				// alive with more than 3 neighbors = dead
				// dead with 3 neighbors = alive
				// otherwise, persists

				if (isAlive && ( livingNeighbors < 2 || livingNeighbors > 3 )) {
					clean[x][y] = false;
				} else if ( isAlive === false && livingNeighbors === 3 ) {
					clean[x][y] = true;
				} else {
					clean[x][y] = data[x][y];
				}
			}
		}

		this.setState({ 
			data: clean,
			generation: this.state.generation + 1
		 })
	},

	clearData: function() {
		var clear = [];

		for ( var i = 0; i < this.state.numRows; i++ ) {
			var row = [];
			for ( var j = 0; j < this.state.numColumns; j++ ) {
				row.push(false);
			}
			clear.push(row);
		}

		return clear;		
	},

	clearBoard: function() { 
		var clear = this.clearData();
		stopInterval();
		this.setState({ 
			data: clear,
			generation: 0,
			going: false
			})
	},

	randomData: function() {
		var newData = randomData(this.state.numRows, this.state.numColumns);
		stopInterval();
		this.setState({ 
			data: newData,
			generation: 0,
			going: false
			});
	},

	go: function() {
		if ( !this.state.going ) {
			startInterval(this.nextGeneration);
			console.log('started')			
		} else {
			console.log('stopping')
			stopInterval();
		}

		var status = !this.state.going;
		this.setState({ 
			going: status 
			})
	},

	render: function() {
		
		var rows = [];

		for (var i = 0; i < this.state.data.length; i++ ) {
			rows.push(<Row 
				x = { i } 
				data = { this.state.data[i] } 
				key = { i } 
				toggle = { this.toggle }/>)
		}

		return (	
			<div className='container'>
				<h1>Game of Life</h1>
				<div>
					<h4>Generation: <span id = 'generation'>{ this.state.generation }</span></h4>
					<ButtonToolbar>
						<Button bsStyle = 'primary' onClick = { this.clearBoard } >Clear</Button>
						<Button bsStyle = 'primary' onClick = { this.randomData } >Random</Button>
						<Button bsStyle = 'primary' onClick = { this.nextGeneration }>Next Generation</Button>
						<Button bsStyle = 'primary' onClick = { this.go } >{ this.state.going ? 'Stop!' : 'Go!' }</Button>
					</ButtonToolbar>
				</div>
				<table>
					<tbody>
						{ rows }
					</tbody>
				</table>
				<div className='row'>
					<div id = 'rules' className = 'col-sm-8 col-sm-offset-2'>
						<h4>Basic rules:</h4>
						<ul>
							<li>Click a square to bring it to life.</li>
							<li>If it has two or three neighbors, it will live on to the next generation. Otherwise, it will die of lonliness or overpopulation. Sad.</li>
							<li>If an empty square has exactly three living neighbors, it will come to life. Procreation...</li>
							<li>Click "Next Generation" to step forward or "Go!" to quickly iterate through generations.</li>
							<li>"Clear" and "Random" reset the board.</li>
						</ul>
						<p><a href = 'https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life' target = '_blank'>More information on The Game of Life (Conway)</a></p>
					</div>
				</div>
			</div>
		)
	}
});

// setting and clearing intervals
var going;
var startInterval = function(nextGen) {
	going = window.setInterval(nextGen, 100);
};
var stopInterval = function() {
	window.clearInterval(going);
}

// create initial board size by changing numRows and numColumns
var numRows = 40;
var numColumns = 70;

var randomData = function(rows, columns) {
	var data = [];

	for ( var i = 0; i < rows; i++ ) {
		var row = [];
		for ( var j = 0; j < columns; j++ ) {
			var value = Math.random() >= 0.5;
			row.push(value);
		}
		data.push(row);
	}

	return data;		
}

var data = randomData(numRows, numColumns);

ReactDOM.render( < Page data = { data } numRows = { numRows } numColumns = { numColumns } / > ,
  	document.getElementById('container')
);