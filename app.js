var svgWidth = 960;
var svgHeight = 600;

var margin = { top: 20, right: 40, bottom: 80, left: 100 };

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var svg = d3
  .select('.chart')
  .append('svg')
  .attr('width', svgWidth)
  .attr('height', svgHeight)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

var chart = svg.append('g');

d3.select('.chart')
	.append('div')
	.attr('class', 'tooltip')
	.style('opacity', 0);

d3.csv('data.csv', function(error, Data123) {

	Data123.forEach(function(data) {
		data.obesity = parseFloat(data.obesity);
		data.poverty = parseFloat(data.poverty);
		data.smokes = parseFloat(data.smokes);
	});

	var y = d3.scaleLinear().range([0,height]);
	var x = d3.scaleLinear().range([0,width]);

	var left = d3.axisLeft(y);
	var bottom = d3.axisBottom(x);

	var x_max;
	var y_max;

	function find_max(xcol, ycol) {

		x_max = d3.max(Data123, function(data) {
			return parseFloat(data[xcol]) * 1.1;
		});

		y_max = d3.max(Data123, function(data) {
			return parseFloat(data[ycol]) * 1.1;
		});
	}

	var current_y = 'obesity';
	var current_x = 'poverty';

	find_max(current_x, current_y);

	x.domain([0,x_max]);
	y.domain([y_max,0]);

	var tooltip = d3.tip()
			.attr('calss', 'tooltip')
			.offset([80,-60])
			.html(function(data) {
				var state = data.abbr;
				var x_points = parseFloat(data[current_x]);
				var x_string;
				var y_points = parseFloat(data[current_y]);
				var y_string;

				if (current_x === 'poverty') {
					x_string = 'Poverty (%): ';
				}

				else if (current_x === 'smokes') {
					x_string = 'Smokes (%): ';
				}

				if (current_y === 'obesity') {
					y_string = 'Obesity (%): ';
				}

				return (state + '<br>' + x_string + x_points + '<br>' + y_string + y_points);
			});

	chart.call(tooltip);

	chart.selectAll('circle')
		.data(Data123)
		.enter()
		.append('circle')
		.attr('cy', function(data) {
			return y(+data[current_y]);
		})
		.attr('cx', function(data) {
			return x(+data[current_x]);
		})
		.attr('r', '20')
		.attr('fill', '#ADD8E6')
		.style('stroke', 'black')
		.on('click', function(data) {
			tooltip.show(data);
		})
		.on('mouseout', function(data) {
			tooltip.hide(data);
		});

	chart.append('g')
		.attr('transform', 'translate(0,' + height + ')')
		.attr('class', 'x_axis')
		.call(bottom);

	chart.append('g').attr('class', 'y_axis').call(left);

	chart.append('text')
		.attr('transform', 'rotate(-90)')
		.attr('y', 0 - margin.left + 40)
		.attr('x', 0 - height / 2)
		.attr('dy', '1em')
		.attr('class', 'axis_text')
		.attr('data-axis-text', 'obesity')
		.text('Obesity (%)');

	chart.append('text')
		.attr('transform', 'translate(' + width / 2 + ',' + (height + margin.top + 20) + ')')
		.attr('class', 'axis_text active')
		.attr('data-axis-text', 'poverty')
		.text('Poverty (%)');

	chart.append('text')
		.attr('transform', 'translate(' + width / 2 + ',' + (height + margin.top + 45) + ')')
		.attr('class', 'axis_text inactive')
		.attr('data-axis-text', 'smokes')
		.text('Smokes (%)');

	function labelChange(clicked) {

		d3.selectAll('.axis_text')
			.filter('.active')
			.classed('active', false)
			.classed('inactive', true);

		clicked.classed('inactive', false),classed('active', true);
	}

	d3.selectAll('.axis_text')
		.on('click', function() {
			var clickedThis = d3.select(this);

			var clickedInactive = clickedThis.classed('inactive');

			var clickedAxis = clickedThis.attr('data-axis-text');

			if (clickedInactive) {

				if (clickedAxis === 'poverty' || clickedAxis === 'smokes') {

					current_x = clickedAxis;
					find_max(current_x);
					x.domain([0,x_max]);

					svg.select('.x-axis')
						.transition()
						.duration(2000)
						.call(bottom);

					d3.selectAll('circle').each(function() {
						d3.select(this)
							.transition()
							.attr('cx', function(data) {
								return x(parseFloat(data[current_x]));
							})
							.duration(2000);
					});

					labelChange(clickedThis);
				}

			}
		});
});