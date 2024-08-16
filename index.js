// url to be fetched from
const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';

// Set dimensions and margins for chart
const margin = { top: 20, right: 30, bottom: 150, left: 60 };
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

// Create an SVG container
const svg = d3.select('body')
    .style('background-color', 'black')
    .style('color', 'white')
    .append('svg')
    .attr('width', '100%')
    .attr('height', height + margin.top + margin.bottom)
    .attr('viewBox', `0 0 ${800} ${height + 64 + margin.top + margin.bottom}`)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

// Create tooltip
const tooltip = d3.select('body').append('div')
    .attr('id', 'tooltip')
    .style('position', 'absolute')
    .style('visibility', 'hidden')
    .style('background-color', '#fff')
    .style('color', 'black')
    .style('border', '1px solid #000')
    .style('padding', '8px')
    .style("border-radius", "4px")
    .style("pointer-events", "none")
    .on('mouseover', (event, d) => {
        const temp = (baseTemperature + d.variance).toFixed(1);
        tooltip.style('visibility', 'visible')
            .html(`Year: ${d.year}<br>Month: ${d.month}<br>Temperature: ${temp}°C`)
            .attr('data-year', d.year)
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 28}px`);
    });
    

// Fetch the data and create the chart
d3.json(url).then(data => {
    const baseTemperature = data.baseTemperature;
    const monthlyVariance = data.monthlyVariance;

    // Create scales
    const xScale = d3.scaleBand()
        .domain(monthlyVariance.map(d => d.year))
        .range([0, width])
        .padding(0.05);

    const yScale = d3.scaleBand()
        .domain(monthlyVariance.map(d => d.month))
        .range([height, 0])
        .padding(0.05);

    const colorScale = d3.scaleSequential(d3.interpolateRdYlBu)
        .domain([
            d3.max(monthlyVariance, d => baseTemperature + d.variance),
            d3.min(monthlyVariance, d => baseTemperature + d.variance)
        ]);

    // Add x-axis
    svg.append('g')
        .attr('id', 'x-axis')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale).tickValues(xScale.domain().filter((d, i) => !(i % 10))));  // Show every 10th year

    // Add y-axis
    svg.append('g')
        .attr('id', 'y-axis')
        .call(d3.axisLeft(yScale).tickFormat(month => {
            const date = new Date(0);
            date.setUTCMonth(month - 1);
            return d3.utcFormat('%B')(date);
        }));

    // Add heatmap
    svg.selectAll('rect')
        .data(monthlyVariance)
        .enter()
        .append('rect')
        .attr('class', 'cell') 
        .attr('x', d => xScale(d.year))
        .attr('y', d => yScale(d.month))
        .attr('width', xScale.bandwidth())
        .attr('height', yScale.bandwidth())
        .attr('fill', d => colorScale(baseTemperature + d.variance))
        .attr('data-month', d => d.month)
        .attr('data-year', d => d.year)
        .attr('data-temp', d => (baseTemperature + d.variance).toFixed(1))
        .on('mouseover', (event, d) => {
            const temp = (baseTemperature + d.variance).toFixed(1);
            tooltip.style('visibility', 'visible')
                .html(`Year: ${d.year}<br>Month: ${d.month}<br>Temperature: ${temp}°C`)
                .attr('data-year', d.year)
                .style('left', `${event.pageX + 10}px`)
                .style('top', `${event.pageY - 28}px`);
        })
        .on('mouseout', () => tooltip.style('visibility', 'hidden'));


    // Define the gradient
    const defs = svg.append('defs');

    const gradient = defs.append('linearGradient')
        .attr('id', 'gradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%');

    gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', d3.interpolateRdYlBu(1));  // Cold color

    gradient.append('stop')
        .attr('offset', '33%')
        .attr('stop-color', d3.interpolateRdYlBu(0.64)); // Middle color

    gradient.append('stop')
        .attr('offset', '66%')
        .attr('stop-color', d3.interpolateRdYlBu(0.32)); // Middle color

    gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', d3.interpolateRdYlBu(0));  // Hot color



    // Legend
    const legendWidth = 400;
    const legendHeight = 20;

    const legend = svg.append('g')
        .attr('id', 'legend')
        .attr('transform', `translate(${margin.left}, ${height + margin.top + 30})`);

    legend.append('rect')
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .style('fill', 'url(#gradient)');
    

    const legendScale = d3.scaleLinear()
        .domain([
            d3.min(monthlyVariance, d => baseTemperature + d.variance),
            d3.max(monthlyVariance, d => baseTemperature + d.variance)
        ])
        .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
        .tickFormat(d3.format('.1f'))
        .ticks(5);

    legend.append('g')
        .attr('transform', `translate(0, ${legendHeight})`)
        .call(legendAxis);

    // Description
    svg.append('text')
        .attr('id','description')
        .attr('x', 120)
        .attr('y', height + margin.bottom - 30)
        .attr('text-anchor', 'left')
        .attr('font-size', '14px')
        .attr('fill', 'white')
        .text('Temperature Variance from Base Temperature (°C)'); 
});
