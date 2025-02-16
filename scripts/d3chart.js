class Chart {
    constructor() {
        // Defining state attributes
        const attrs = {
            id: "ID" + Math.floor(Math.random() * 1000000),
            svgWidth: 400,
            svgHeight: 10,
            marginTop: 5,
            marginBottom: 25,
            marginRight: 200,
            marginLeft: 5,
            container: "body",
            defaultTextFill: "#2C3E50",
            defaultFont: "Helvetica",
            data: null,
            chartWidth: null,
            chartHeight: null
        };

        // Defining accessors
        this.getState = () => attrs;
        this.setState = (d) => Object.assign(attrs, d);

        // Automatically generate getter and setters for chart object based on the state properties;
        Object.keys(attrs).forEach((key) => {
            //@ts-ignore
            this[key] = function (_) {
                if (!arguments.length) {
                    return attrs[key];
                }
                attrs[key] = _;
                return this;
            };
        });

        // Custom enter exit update pattern initialization (prototype method)
        this.initializeEnterExitUpdatePattern();
    }


    render() {
        this.setDynamicContainer();
        this.calculateProperties();
        this.drawSvgAndWrappers();
        this.deleteOrReplaceThisMethod();
        return this;
    }

    calculateProperties() {
        const {
            marginLeft,
            marginTop,
            marginRight,
            marginBottom,
            svgWidth,
            svgHeight
        } = this.getState();

        //Calculated properties
        var calc = {
            id: null,
            chartTopMargin: null,
            chartLeftMargin: null,
            chartWidth: null,
            chartHeight: null
        };
        calc.id = "ID" + Math.floor(Math.random() * 1000000); // id for event handlings
        calc.chartLeftMargin = marginLeft;
        calc.chartTopMargin = marginTop;
        const chartWidth = svgWidth - marginRight - calc.chartLeftMargin;
        const chartHeight = svgHeight - marginBottom - calc.chartTopMargin;

        this.setState({
            calc,
            chartWidth,
            chartHeight
        });
    }

    deleteOrReplaceThisMethod() {
        const {
            chart,
            data,
            chartWidth,
            chartHeight
        } = this.getState();

        const realData = d3.csv('https://raw.githubusercontent.com/bumbeishvili/tech-survey-data/refs/heads/main/Georgian%20Tech%20Survey%20-%202023%20(Responses)%20-%20Form%20Responses%201.csv').then(realData => {
            const data = realData.map(d => {
                return {
                    year: 2023,
                    sex: d.სქესი,
                    age: d.ასაკი,
                    experience: d[" სამუშაო გამოცდილება tech სფეროში"],
                    fromLearningToJobTime: d["თქვენს სფეროში სწავლის დაწყებიდან, რამდენ ხანში დაიწყეთ მუშაობა?"],
                    devType: d["რომელ კატეგორიას მიეკუთვნებით ყველაზე მეტად?"],
                    firstLanguage: d["რომელი ენით დაიწყეთ პროგრამირების სწავლა?"],
                    currentLanguge: d["რომელ პროგრამირების ენას იყენებთ  ამჟამად ძირითადად?"],
                    mainFramework: d[" რომელ framework-ს იყენებთ ძირითადად?"],
                    employmenType: d["დასაქმების ტიპი"],
                    workType: d[" სამუშაოს ტიპი"],
                    workLanguge: d["სამუშაო ენა"],
                    employerType: d["ძირითადი დამსაქმებელი ორგანიზაცის საქმიანობის სფერო "],
                    phyiscalLocation: d["ქვეყანა სადაც ფიზიკურად იმყოფებით"],
                    monthlyWage: d["საშუალო თვიური შემოსავალი ხელზე ლარებში ბოლო 1 წლის მანძილზე"],
                    mostWageCameFrom: d["ქვეყანა, საიდანაც ყველაზე მეტი შემოსავალი გაქვთ მიღებული  ბოლო ერთი წლის მანძილზე"],
                    satisfeidByWork: d["კმაყოფილი ხართ ახლანდელი სამუშაო ადგილით?"],
                    avarageWorkHourMonthly: d["17. საშუალოდ რამდენ საათს მუშაობთ თვეში (და არა კვირაში!) ?"],
                    educationLevel: d["განათლების დონე"],
                    gpa: d["თქვენი GPA უნივერსიტეტში (თუ სწავლობთ ან დამთავრებული გაქვთ)"]
                }
            })

            const filteredData = data.filter(d => d.currentLanguge !== '' && d.currentLanguge !== 'სამსახურში golang+java/kotlin+python+ts+c/c++ stack' && d.currentLanguge !== 'Python, Sql' && d.currentLanguge !== 'Typescript & PHP')
            console.log(filteredData)
            const groupedData = d3.groups(filteredData, d => d.currentLanguge)
                .sort((a, b) => b[1].length - a[1].length)

            const differenaceBetweenContent = chartHeight / groupedData.length

            let titles = chart._add('foreignObject.mainTitles', groupedData)
                .attr('height', 50)
                .attr('width', 100)
                .attr('x', 10)
                .attr('y', (d, i) => {
                    return differenaceBetweenContent * i
                })
                .attr("font-family", "Montserrat, sans-serif")
                .html(d => `<div class="text-right truncate text-sm font-thin"> ${d[0] == 'არც ერთს' ? 'None'  : d[0]}</div>`)
            const barStartX = 120
            const rectScaleX = d3.scaleLinear().domain([d3.min(groupedData, d => d[1].length),d3.max(groupedData, d => d[1].length)]).range([20, chartWidth])

            chart.append('defs')
                .append('linearGradient')
                .attr('id', 'blueGreenGradient')
                .attr('x1', '0%')
                .attr('y1', '0%')
                .attr('x2', '100%')
                .attr('y2', '0%')
                .append('stop')
                .attr('offset', '0%')
                .attr('stop-color', '#1E3A8A')
                .attr('stop-opacity', 1);

            chart.select('defs')
                .select('linearGradient')
                .append('stop')
                .attr('offset', '100%')
                .attr('stop-color', '#22C55E')
                .attr('stop-opacity', 1);

            let rects = chart._add('rect.main-rects', groupedData)
                .attr('x', barStartX)
                .attr('y', (d, i) => {
                    return differenaceBetweenContent * i  + 7
                })
                .attr('height',  d => (chartHeight / groupedData.length) / (differenaceBetweenContent / groupedData.length) - 10 )
                .attr('fill', 'url(#blueGreenGradient)')
                .attr('rx', 5)
                .attr('ry', 5)
                .on('click', function (e, d) {

                })
                .transition()
                .duration((d, i) => i * 200)
                .attr('width', d => rectScaleX(d[1].length))


            const sum = d3.sum(groupedData, d => d[1].length)

            let rectLabels = chart._add('foreignObject.precentage', groupedData)
                .attr('width', 100)
                .attr('height', 20)
                .attr('y', (d, i) => {
                    return differenaceBetweenContent * i
                })
                .attr("font-family", "Montserrat, sans-serif")
                .html(d => `${(Math.ceil((d[1].length / sum) * 1000) / 10).toFixed(2)}%`)
                .transition()
                .duration((d, i) => i * 100)
                .attr('x', d => rectScaleX(d[1].length) + 130)

            console.log(sum)


        })


    }

    drawSvgAndWrappers() {
        const {
            d3Container,
            svgWidth,
            svgHeight,
            defaultFont,
            calc,
            data,
            chartWidth,
            chartHeight
        } = this.getState();

        // Draw SVG
        const svg = d3Container._add('svg.svg-container')
            .attr("width", svgWidth)
            .attr("height", svgHeight)
            .style("background", "none")
            .attr("font-family", defaultFont);

        //Add container g element
        var chart = svg._add('g.chart')
            .attr(
                "transform",
                "translate(" + calc.chartLeftMargin + "," + calc.chartTopMargin + ")"
            );


        this.setState({
            chart,
            svg
        });
    }

    initializeEnterExitUpdatePattern() {
        d3.selection.prototype._add = function (classSelector, data, params) {
            const container = this;
            const split = classSelector.split(".");
            const elementTag = split[0];
            const className = split[1] || 'not-good';
            const exitTransition = params ?.exitTransition;
            const enterTransition = params ?.enterTransition;

            let bindData = data;
            if (typeof data === 'function') {
                bindData = data(container.datum());
            }
            if (bindData && !Array.isArray(bindData)) {
                bindData = [bindData]
            }
            if (!bindData) {
                if (container.datum()) {
                    bindData = d => [d];
                } else {
                    bindData = [className];
                }
            }

            let selection = container.selectAll(elementTag + '.' + className).data(bindData, (d, i) => {
                if (typeof d === "object" && d.id) return d.id;
                return i;
            });
            if (exitTransition) {
                exitTransition(selection);
            } else {
                selection.exit().remove();
            }
            const enterSelection = selection.enter().append(elementTag);
            if (enterTransition) {
                enterTransition(enterSelection);
            }
            selection = enterSelection.merge(selection);
            selection.attr("class", className)

            if (className == 'not-good') {
                selection
                    .attr('stroke', className == 'not-good' ? 'red' : null)
                    .attr('stroke-width', className == 'not-good' ? 10 : null)
                selection.selectAll('title').data(['not-good']).join('title').text("You don't have a class set for this element!")
            }

            return selection;
        }
    }

    setDynamicContainer() {
        const attrs = this.getState();

        //Drawing containers
        var d3Container = d3.select(attrs.container);
        var containerRect = d3Container.node().getBoundingClientRect();
        if (containerRect.width > 0) attrs.svgWidth = containerRect.width;

        const self = this;

        d3.select(window).on("resize." + attrs.id, function () {
            var containerRect = d3Container.node().getBoundingClientRect();
            if (containerRect.width > 0) attrs.svgWidth = containerRect.width;
            self.render();
        });

        this.setState({
            d3Container
        });
    }
}