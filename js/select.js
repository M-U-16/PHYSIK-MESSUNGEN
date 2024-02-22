function Select(start_range) {

    const timeRangeBtn = document.getElementById("time-select-button")
    const selectOptions = document.querySelectorAll(".app__select-option")
    const selectContainer = document.querySelector(".app__select-options-container")
    const indicatorArrow = document.querySelector("#select-arrow-icon")
    const timeRangeDisplay = document.querySelector("#time-select-text")
    
    const activeContainerClass = "active-select-container"
    const activeButtonClass = "active-select-button"
    
    let selectedState = false

    function closeAll() {

        timeRangeBtn.classList.toggle(activeButtonClass)

        selectContainer.classList.remove(activeContainerClass)
        indicatorArrow.style.transform = `rotate(${0}deg)`
        selectedState = false
    }

    function addListeners(optionAction) {
        /* ADDS EVENTLISTENER TO SELECT BUTTON */
        timeRangeBtn.addEventListener("click", () => {
            selectedState = !selectedState
            
            selectContainer.classList.toggle(activeContainerClass)
            timeRangeBtn.classList.toggle(activeButtonClass)

            if (!selectedState) indicatorArrow.style.transform = `rotate(${0}deg)`
            if (selectedState) indicatorArrow.style.transform = `rotate(${180}deg)`
        })
        /* ADDS CLICK EVENTLISTENER TO EVERY OPTION BUTTON */
        selectOptions.forEach(option => {
            option.addEventListener("click", () => {
                //if (option.innerHTML != timeRangeDisplay.innerHTML) {
                timeRangeDisplay.innerHTML = option.innerHTML
                timeRangeBtn.dataset.current = option.dataset.value
                optionAction(option.dataset.value)
                closeAll()
            })
        })
    }

    function init(func) {
        addListeners(func)
        timeRangeBtn.dataset.current = start_range
        selectOptions.forEach(option => {
            if (option.dataset.value == start_range) {
                timeRangeDisplay.innerHTML = option.innerHTML
            }
        })
    }

    return {
        init,
        addListeners
    }
}