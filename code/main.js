loadData()

async function loadData() {
    const parseDate = d3.timeParse("%S.%L")
    const data = await d3.dsv(";","formatted.csv", (d) => {
        const newSample = {
            time: parseDate(d.t),
            voltage: +d.v,
        }
        //console.log(newSample)
        return newSample
    })
    LineChart(getConfig("#container", await data, "time", "voltage", "1s", "svg-graph"))
}

function LineChart(initial_config) {
    console.log(initial_config)
    
    let config = initial_config
    const margin = config.margin
    
    let tooltip, x, y
    let data = config.entrys
    let width = calcWidth()
    let height = calcHeight()

    /* SVG ELEMENT */
    let svg = d3.select(config.container)
        .append("svg")
        .attr("class", "dashboard__graph")
        .attr("width", config.width)
        .attr("height", config.height)
        .attr("id", config.id)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)

    /* GRADIENT */
    const gradient_id = `gradient-graph-${config.y}`
    const gradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", gradient_id)
        .attr("x1", "0%")
        .attr("x2", "0%")
        .attr("y1", "0%")
        .attr("y2", "100%")
        .attr("spreadMethod", "pad")

    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", config.styles.color)
        .attr("stop-opacity", 1)

    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", config.styles.color)
        .attr("stop-opacity", 0)

    /*  ADDING AXIS */
    /* X AXIS */
    const x_axis = svg.append("g")
        .attr("class", "linechart__x-axis")
        .style("font-size", "13px")
        .attr("transform", `translate(0, ${height})`)

    /* Y AXIS */
    const y_axis = svg.append("g")
        .attr("class", "linechart__y-axis")
        .style("font-size", "13px")
        .attr("transform", `translate(0, 0)`)
        
    updateGraph() // first load

    function updateGraph(duration) {

        x = get_x_scale(data)
        y = get_y_scale(data)

        // create the x axis:
        x_axis.transition()
        .duration(duration)
        .call(
            d3.axisBottom(x)
            .tickValues(x.ticks(config.axisFormat.x.ticks))
            .tickFormat(config.axisFormat.x.timeFormat)
        )
            
        // create the y axis:
        y_axis.transition()
        .duration(duration)
        .call(
            d3.axisLeft(y)
            .ticks(config.axisFormat.y.ticks)
            .tickFormat(config.axisFormat.y.tickFormat)
        )

        /* GRID LINES */
        // remove all grid lines
        d3.selectAll(config.container + " .graph__grid-line" ).remove()
        // append all x grid lines
        let grid_x = svg.selectAll("graph__grid-line-x")
        .data(x.ticks())
        .enter()
        .append("line")
        .attr("class", "graph__grid-line-x graph__grid-line")
        .attr("x1", d => x(d))
        .attr("y1", 0)
        .attr("x2", d => x(d))
        .attr("y2", height)
        
        // append all y grid lines
        let grid_y = svg.selectAll("graph__grid-line-y")
        .data(y.ticks())
        .enter()
        .append("line")
        .attr("class", "graph__grid-line-y graph__grid-line")
        .attr("x1", 0)
        .attr("y1", d => y(d))
        .attr("x2", width)
        .attr("y2", d => y(d))

        let line = svg.selectAll(".graph__line")
        .data([data], (d) => d.entry_date)
        line.enter()
        .append("path")
        .attr("class", "graph__line")
        .merge(line)
        .transition()
        .duration(duration)
        .attr("d", getLine())
        .attr("fill", "none")
        .attr("stroke", config.styles.color)
        .attr("stroke-width", config.styles.line.strokeWidth)
        
        /* ADDING AREA PATH */
        /* let area = svg.selectAll(".graph__area")
        .data([data], d => d.entry_date)
        area.enter()
        .append("path")
        .attr("class", "graph__area")
        .merge(area)
        .style("fill", `url(#${gradient_id})`)
        .style("pointer-events", "none")
        .style("opacity", 0)
        .transition()
        .duration(duration)
        .attr("d", getArea())
        .style("opacity", 1) */

    }
    /* LINE */
    function getLine() {
        return d3.line()
            .x(d => x(d[config.x]))
            .y(d => y(d[config.y]))
    }
    /* AREA */
    function getArea() {
        return d3.area()
            .x(d => x(d[config.x]))
            .y0(height)
            .y1(d => y(d[config.y]))
    }
    function get_y_scale(data) {
        return d3.scaleLinear()
            .range([height, 0])
            .domain(config.axisFormat.y.domain(data, config.y))
    }
    function get_x_scale(data) {
        console.log(data)
        return d3.scaleTime()
            .range([0, width])
            .domain([data[0].time, data[data.length-1].time])
            //.domain(d3.extent(data, d => d[config.x]))
    }
    function resize() {
        const container = document.querySelector(config.container)
        // get new dimensions from container
        config.width = container.offsetWidth
        config.height = container.offsetHeight

        // resize svg with margin
        width = calcWidth()
        height = calcHeight()

        // calculate new scale
        x = get_x_scale(data)
        y = get_y_scale(data)

        // transform axis
        x_axis.attr("transform", `translate(0, ${height})`)
        y_axis.attr("transform", `translate(${width}, 0)`)

        updateGraph(500)
    }
    function calcWidth() { return config.width - config.margin.left - config.margin.right }
    function calcHeight() { return config.height - config.margin.bottom - config.margin.top }
    function addData(obj) { data.push(formatEntry(obj, config.y)) }
    function updateAxisFormat(newFormat) {
        config.axisFormat = {
            ...newFormat
        }
    }
    function setData(arr) {
        data = formatEntrys(arr, config.y)
        console.log(data)
    }

    return {
        config,
        addData,
        setData,
        resize,
        updateGraph,
        updateAxisFormat
    }
}

async function formatEntrys(entrys, ...args) {
    console.log(entrys, args)
    /* const parseDate = d3.timeParse("%S.%M")
    const newEntrys = entrys.forEach(entry => {
        const formatedObj = {}
        console.log(typeof(entry["time"]))
        formatedObj.time = parseDate(entry["time"])
        args.forEach(arg => formatedObj[arg] = entry[arg])
        return formatedObj
    })
    console.log(newEntrys) */
    /* const parseDate = d3.timeParse("%L")
    return entrys.map(entry => {
        const formatedObj = {}
        formatedObj.entry_date = parseDate(entry["entry_date"])
        args.forEach(arg => formatedObj[arg] = entry[arg])
        return formatedObj
    }) */
}

function formatEntry(entry, ...args) {
    console.log(entry)
    const formatedEntry = {}
    formatedEntry.time = parseDate(entry["time"])
    args.forEach(arg => formatedEntry[arg] = entry[arg])
    return formatedEntry
}

const default_conf = {
    margin: {
        top: 40,
        right: 60,
        bottom: 40,
        left: 30
    },
    axis: {
        x: { class: "x-axis" },
        y: { class: "y-axis" }
    },
}
const styles_conf = {
    default: {
        fontSize: "14px",
        line: { strokeWidth: "3px" },
        area: { opacity: 0.5 },
    },
    temp: { 
        color: "#ff8080",
        dots: "#f00", //#ff0000
        axis: {
            color: "white",
        },
    },
    humi: {
        color: "#09bff7",
        dots: "#00f", //#09a4f7
        axis: {
            color: "grey",
        },
    },
    voltage: {
        color: "#ff8080",
        dots: "lightblue",
        axis: {
            color: "black"
        }
    }
}
const y_units_conf = {
    temp: "°C",
    humi: "%",
    voltage: "V"
}
const value_config = {
    temp: {
        domain: (data, y) => {
            let min = d3.min(data, d => d[y])
            let max = d3.max(data, d => d[y])
            
            let start = min >= 0 ? 0 : min -10
            let end = (Math.round(max / 10) * 10) + 10
            return [start, end]
        }
    },
    humi: {
        domain: () => [0, 100]
    },
    voltage: {
        domain: (data, y) => {
            let min = d3.min(data, d => d[y])
            let max = d3.max(data, d => d[y])
            
            let start = min >= 0 ? 0 : min -2
            let end = (Math.round(max / 10) * 10) + 2
            return [start, end]
        }
    }
}
function getAxisFormat(time, unit, y) {
    const range = { x: {}, y:{}}
    range.y.domain = value_config[y].domain

    if (time === "1m") {
        range.x.ticks = d3.timeWeek.every(1)
        range.x.timeFormat = d3.timeFormat("%e %b")
        range.y.tickFormat =  d => isNaN(d) ? "" : `${d}` + unit
        range.y.ticks = 6
        return range
    }
    if (time === "1y") {
        range.x.ticks = d3.timeMonth.every(1)
        range.x.timeFormat = d3.timeFormat("%b")
        range.y.tickFormat = d => isNaN(d) ? "" : `${d}` + unit
        range.y.ticks = 6
        return range

    }
    if (time === "1w") {
        range.x.ticks = d3.timeDay.every(1)
        range.x.timeFormat = d3.timeFormat("%a")
        range.y.tickFormat = d => isNaN(d) ? "" : `${d}` + unit
        range.y.ticks = 10
        return range
    }
    if (time === "1s") {
        range.x.ticks = d3.timeSecond.every(1)
        range.x.timeFormat = d3.timeFormat("%M:%S")
        range.y.tickFormat = d => isNaN(d) ? "" : `${d}`
        range.y.ticks = 15
        return range
    }
    
}

function getConfig (
    container_id,
    data,
    x, y,
    timePeriod,
    id
) {
    const container = document
        .querySelector(container_id)

    return {
        ...default_conf,
        y: y,
        x: x,
        id: id,
        entrys: data,
        container: container_id,
        timeRange: timePeriod,
        width: container.offsetWidth,
        height: container.offsetHeight,
        axisFormat: {
            ...getAxisFormat(timePeriod, y_units_conf[y], y),
        },
        y_unit: y_units_conf[y],
        styles: {
            ...styles_conf.default,
            ...styles_conf[y]
        } 
    }
}