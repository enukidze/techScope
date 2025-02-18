class ChartTreemap {
    constructor() {
        // Defining state attributes
        const attrs = {
            id: "ID" + Math.floor(Math.random() * 1000000),
            svgWidth: 400,
            svgHeight: 200,
            marginTop: 5,
            marginBottom: 5,
            marginRight: 5,
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

        // const label = chart._add('foreignObject.main-lable')
        //     .attr('width', 300)
        //     .attr('height', 100)
        //     .attr('x', (chartWidth / 2) - 40)
        //     .attr('y', chartHeight / 2)
        //     .html(`<div class="text-3xl">Spider Chart</div>`)
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
                    gpa: d["თქვენი GPA უნივერსიტეტში (თუ სწავლობთ ან დამთავრებული გაქვთ)"],
                }
            })

            const groupedData = d3.groups(data, d => d.devType).filter(d => d[0] != '')

            const formattedData = {
                name: "root",
                children: groupedData.map(d => ({
                    name: d[0],
                    value: d[1].length // Use the array’s length as the value
                }))
            };

            const colorScale = d3.scaleLinear()
                .domain([d3.min(formattedData.children, d => d.value) , d3.max(formattedData.children, d => d.value)])
                .range(['#1E3A8A', '#22C55E'])


            const treemapFunc = d3.treemap().size([chartWidth, chartHeight]).padding(1)


            const root = d3.hierarchy(formattedData).sum(d => d.value).sort((a, b) => b.value - a.value);

            const treeMap = treemapFunc(root)


            const rects = chart._add('rect.treemap-rects', treeMap.leaves())
                .attr("fill", (d, i) => colorScale(d.value)) // Use D3 color scale
                .attr("stroke", "white")
                .transition()
                .duration((d,i) => i * 100)
                .attr("width", d => d.x1 - d.x0)
                .attr("height", d => d.y1 - d.y0)
                .attr("x", d => d.x0)
                .attr("y", d => d.y0)



            const labels = chart._add('foreignObject.treemap-labels', treeMap.leaves())
            .style("pointer-events", "none")
            .html(d => `<div class="text-white font-bold ${d.value > 5 ? 'p-1 text-xs text-left' : 'text-[6px] font-light'}">${d.data.name} ${d.data.value} </div>`)
            .transition()
                .duration((d,i) => i * 100)
                .attr("x", d => d.x0)
                .attr("y", d => d.y0)
                .attr("width", d => d.x1 - d.x0)
                .attr("height", d => d.y1 - d.y0)

            console.log(treeMap.leaves())
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