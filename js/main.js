// https://main--physik-messungen.netlify.app/

const chart = Chart()
async function getData(type, value) {
    if (!type || !value) return new Error("Missing Value")
    
    return d3.dsv(";", `formatted_data/${type}-${value}.csv`)
        .then(data => {
            return formatData(data)
        })
}
async function Chart() {
    let current_state = "100mF_50ohm"

    const data_kon = await getData("kondensator", current_state)
    const data_wid = await getData("widerstand", current_state)

    /* -------------------------- */

    const chartKondensator = document.querySelector("#chart-voltage")
    const widthKon = chartKondensator.offsetWidth
    const heightKon = chartKondensator.offsetHeight
    
    const cfilterKon = crossfilter(data_kon)
    const timeDim = cfilterKon.dimension(d => d.time)
    const voltageGroup = timeDim.group().reduceSum(d => d.voltage)

    const minDate = timeDim.bottom(1)[0].time;
    const maxDate = timeDim.top(1)[0].time;

    const chartVoltage = dc.lineChart("#chart-voltage")
        
    chartVoltage.margins({top: 20, left: 50, right: 50, bottom: 50})
    chartVoltage.yAxisPadding("10%")
    chartVoltage
        .width(widthKon)
        .height(heightKon)
        .dimension(timeDim)
        .group(voltageGroup)
        .brushOn(false)
        .elasticY(true)
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)
        .x(d3.scaleTime().domain([minDate, maxDate]))
        .xAxis().tickFormat(d3.timeFormat("%S:%L"))
        
                   
    const chartResistor = document.querySelector("#chart-current-voltage")
    const widthRes = chartResistor.offsetWidth
    const heightRes = chartResistor.offsetHeight
    const cfilterWid = crossfilter(data_wid)

    const timeDimRis = cfilterWid.dimension(d => d.time)
    const voltageGroupRis = timeDimRis.group().reduceSum(d => d.voltage)

    const minDateRis = timeDimRis.bottom(1)[0].time;
    const maxDateRis = timeDimRis.top(1)[0].time;

    const chartRis = dc.lineChart("#chart-current-voltage")

    chartRis.margins({top: 20, left: 50, right: 50, bottom: 50})
    chartRis.yAxisPadding("10%")
    /* chartRis.label(d => "lol") */
    chartRis
        .width(widthRes)
        .height(heightRes)
        .dimension(timeDimRis)
        .group(voltageGroupRis)
        .brushOn(false)
        .elasticY(true)
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)
        .x(d3.scaleTime().domain([minDateRis, maxDateRis]))
        .xAxis().tickFormat(d3.timeFormat("%S:%L"))

    dc.renderAll();

    const select = Select(current_state)
    select.init(async(value) => {
        const new_data_kon = await getData("kondensator", value)
        const new_data_wid = await getData("widerstand", value)
        cfilterKon.remove((d) => d)
        cfilterWid.remove(d => d)
        cfilterKon.add(new_data_kon)
        cfilterWid.add(new_data_wid)
        dc.renderAll()
    })

}

function formatData(data) {
    const parser = d3.timeParse("%S.%L")

    return data.map(sample => {
        return {
            time: parser(sample.t),
            voltage: +sample.v,
        }
    })
}